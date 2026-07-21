import { NextResponse } from "next/server";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Consulta de veículo por placa (dados públicos, SEM dados do proprietário).
 *
 * A fonte é um provedor licenciado de dados veiculares (ex.: Consultar Placa),
 * configurado por `VEICULO_API_KEY` (+ opcional `VEICULO_API_URL`). Enquanto a
 * chave não estiver configurada, a rota responde `not_configured` e a tela
 * mostra o pré-lançamento. Ao ativar, mapeamos a resposta do provedor para o
 * formato normalizado abaixo (dados básicos — camada grátis).
 */

function normalizarPlaca(p: string): string {
  return (p || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function placaValida(p: string): boolean {
  // Antiga: ABC1234 | Mercosul: ABC1D23
  return /^[A-Z]{3}[0-9]{4}$/.test(p) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(p);
}

export async function POST(req: Request) {
  const { ok } = rateLimit(`veiculo:${clientKey(req)}`, { limit: 10 });
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

  const apiKey = process.env.VEICULO_API_KEY;
  if (!apiKey) {
    // Serviço ainda não ativado (sem provedor configurado).
    return NextResponse.json({ status: "not_configured", placa });
  }

  // ---- Ativação (quando a chave existir) ----
  // Aqui chamamos o provedor e devolvemos o formato normalizado:
  // { status:"ok", placa, dados:{tipo,marca,modelo,ano,cor,combustivel,municipio,uf},
  //   situacao:{rouboFurto,sinistro,leilao}, fipe:{valor,codigo} }
  // A implementação exata é finalizada com a resposta real do provedor.
  try {
    const base = process.env.VEICULO_API_URL || "https://api.consultarplaca.com.br";
    const r = await fetch(`${base}/veiculo/${placa}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 60 * 60 }, // cache 1h por placa
    });
    if (!r.ok) {
      return NextResponse.json(
        { status: "error", error: "Não foi possível consultar agora." },
        { status: 502 },
      );
    }
    const data = await r.json();
    return NextResponse.json({ status: "ok", placa, provider: data });
  } catch {
    return NextResponse.json(
      { status: "error", error: "Falha ao consultar o veículo." },
      { status: 500 },
    );
  }
}
