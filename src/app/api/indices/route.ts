import { NextResponse } from "next/server";
import { INDICES, type IndiceId, type IndiceMensal } from "@/lib/bcb";
import { fetchSgs } from "@/lib/bcb-server";

/** Série histórica mensal de IPCA / IGP-M / INPC (Banco Central), com cache de 6h. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("indice") as IndiceId | null;
  const indice = id ? INDICES[id] : undefined;
  if (!indice) {
    return NextResponse.json({ error: "Índice inválido." }, { status: 400 });
  }
  const ano = new Date().getFullYear();
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${indice.serie}/dados?formato=json&dataInicial=01/01/1995&dataFinal=31/12/${ano}`;
  try {
    const raw = await fetchSgs<{ data: string; valor: string }>(url);
    const dados: IndiceMensal[] = raw.map((x) => {
      const [, mm, aaaa] = x.data.split("/");
      return { m: `${aaaa}-${mm}`, v: Number(x.valor) };
    });
    return NextResponse.json(
      { indice: id, nome: indice.nome, dados },
      { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
    );
  } catch (e) {
    console.error("[api/indices]", e);
    return NextResponse.json(
      { error: "O Banco Central não respondeu. Tente novamente em instantes." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
