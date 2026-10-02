import { NextResponse } from "next/server";
import type { TaxasAtuais } from "@/lib/bcb";
import { fetchSgs } from "@/lib/bcb-server";

/** Últimos valores de Selic, CDI, TR e poupança (Banco Central), com cache de 6h. */
async function ultimo(serie: number): Promise<number> {
  const [x] = await fetchSgs<{ valor: string }>(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/1?formato=json`,
  );
  const v = Number(x?.valor);
  if (!isFinite(v)) throw new Error(`BCB: valor inválido na série ${serie}`);
  return v;
}

export async function GET() {
  try {
    const [selic, cdi, tr, poupanca] = await Promise.all([
      ultimo(432), // Selic meta (% a.a.)
      ultimo(4389), // CDI anualizado (% a.a.)
      ultimo(226), // TR (% no mês)
      ultimo(195), // poupança (% no mês)
    ]);
    const body: TaxasAtuais = { selic, cdi, tr, poupanca, atualizadoEm: new Date().toISOString() };
    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" },
    });
  } catch (e) {
    console.error("[api/taxas]", e);
    return NextResponse.json(
      { error: "O Banco Central não respondeu. Tente novamente em instantes." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
