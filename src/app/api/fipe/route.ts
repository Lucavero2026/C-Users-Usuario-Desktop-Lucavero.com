import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE = "https://parallelum.com.br/fipe/api/v1";

/** Proxy da API pública da Tabela FIPE (evita CORS e centraliza o cache). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  // Só permite os caminhos esperados da FIPE (evita SSRF).
  if (!/^(carros|motos|caminhoes)[a-zA-Z0-9/_-]*$/.test(path)) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 });
  }
  try {
    const r = await fetch(`${BASE}/${path}`, {
      next: { revalidate: 60 * 60 * 12 }, // cache 12h
    });
    if (!r.ok) {
      return NextResponse.json(
        { error: "Não foi possível consultar a FIPE agora." },
        { status: 502 },
      );
    }
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Falha ao consultar a FIPE." },
      { status: 500 },
    );
  }
}
