import { NextResponse } from "next/server";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Consulta de veículo por placa via Consultar Placa (dados públicos, SEM dados
 * do proprietário). Camada GRÁTIS: dados do veículo (endpoint /v2/consultarPlaca,
 * 1 consulta barata). Roubo/furto, sinistro, leilão e FIPE são endpoints
 * separados e pagos → entram no "relatório completo" (fase de pagamento).
 *
 * Auth: Basic base64(VEICULO_API_EMAIL:VEICULO_API_KEY).
 */

function normalizarPlaca(p: string): string {
  return (p || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function placaValida(p: string): boolean {
  return /^[A-Z]{3}[0-9]{4}$/.test(p) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(p);
}

export async function POST(req: Request) {
  const { ok } = rateLimit(`veiculo:${clientKey(req)}`, { limit: 6 });
  if (!ok) {
    return NextResponse.json(
      { status: "error", error: "Muitas consultas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  let placa = "";
  try {
    const body = await req.json();
    placa = normalizarPlaca(String(body?.placa || ""));
  } catch {
    return NextResponse.json({ status: "error", error: "Requisição inválida." }, { status: 400 });
  }
  if (!placaValida(placa)) {
    return NextResponse.json(
      { status: "error", error: "Placa inválida. Use o formato ABC1234 ou ABC1D23." },
      { status: 400 },
    );
  }

  const email = process.env.VEICULO_API_EMAIL;
  const key = process.env.VEICULO_API_KEY;
  if (!email || !key) {
    return NextResponse.json({ status: "not_configured", placa });
  }

  const base = process.env.VEICULO_API_URL || "https://api.consultarplaca.com.br";
  const auth = Buffer.from(`${email}:${key}`).toString("base64");

  try {
    const r = await fetch(`${base}/v2/consultarPlaca?placa=${placa}`, {
      headers: { Authorization: `Basic ${auth}` },
      next: { revalidate: 60 * 60 * 24 }, // cache 24h por placa (economiza créditos)
    });
    if (r.status === 401) {
      return NextResponse.json(
        { status: "error", error: "Falha de autenticação com o provedor." },
        { status: 502 },
      );
    }
    if (!r.ok) {
      return NextResponse.json(
        { status: "error", error: "Não foi possível consultar agora." },
        { status: 502 },
      );
    }
    const data = await r.json();
    const v = data?.dados?.informacoes_veiculo?.dados_veiculo;
    const t = data?.dados?.informacoes_veiculo?.dados_tecnicos;
    if (data?.status !== "ok" || !v) {
      return NextResponse.json(
        { status: "error", error: "Veículo não encontrado para esta placa." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "ok",
      placa,
      dados: {
        tipo: t?.tipo_veiculo || null,
        marca: v.marca || null,
        modelo: v.modelo || null,
        ano: v.ano_modelo && v.ano_modelo !== "0" ? v.ano_modelo : v.ano_fabricacao || null,
        cor: v.cor || null,
        combustivel: v.combustivel || null,
        municipio: v.municipio || null,
        uf: v.uf_municipio || null,
      },
    });
  } catch {
    return NextResponse.json(
      { status: "error", error: "Falha ao consultar o veículo." },
      { status: 500 },
    );
  }
}
