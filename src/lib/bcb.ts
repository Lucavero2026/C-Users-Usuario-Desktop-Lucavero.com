/**
 * Dados públicos do Banco Central (SGS). Gratuitos e sem chave.
 * Usados pelas calculadoras via rotas /api/indices e /api/taxas (com cache).
 */

export type IndiceId = "ipca" | "igpm" | "inpc";

export const INDICES: Record<IndiceId, { serie: number; nome: string; descricao: string }> = {
  ipca: { serie: 433, nome: "IPCA", descricao: "Inflação oficial do Brasil (IBGE)" },
  igpm: { serie: 189, nome: "IGP-M", descricao: "Índice tradicional dos contratos de aluguel (FGV)" },
  inpc: { serie: 188, nome: "INPC", descricao: "Inflação para famílias de 1 a 5 salários mínimos (IBGE)" },
};

/** Variação mensal: mês "AAAA-MM" → % no mês. */
export interface IndiceMensal {
  m: string;
  v: number;
}

export interface TaxasAtuais {
  /** Selic meta, % ao ano */
  selic: number;
  /** CDI anualizado, % ao ano */
  cdi: number;
  /** TR do mês, % */
  tr: number;
  /** rendimento da poupança no mês, % */
  poupanca: number;
  atualizadoEm: string;
}

/** Fator acumulado de uma lista de variações mensais (em %). */
export function fatorAcumulado(lista: IndiceMensal[]): number {
  return lista.reduce((f, x) => f * (1 + x.v / 100), 1);
}

/** "2026-08" → "ago/2026" */
export function mesLabel(m: string): string {
  const [a, mm] = m.split("-").map(Number);
  const nomes = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${nomes[mm - 1]}/${a}`;
}

/** Soma meses a "AAAA-MM". */
export function addMeses(m: string, n: number): string {
  const [a, mm] = m.split("-").map(Number);
  const total = a * 12 + (mm - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

// ---------- Uso no navegador ----------

const cacheIndices = new Map<IndiceId, Promise<IndiceMensal[]>>();

export function carregarIndice(id: IndiceId): Promise<IndiceMensal[]> {
  if (!cacheIndices.has(id)) {
    cacheIndices.set(
      id,
      fetch(`/api/indices?indice=${id}`, { signal: AbortSignal.timeout(20000) })
        .then((r) => {
          if (!r.ok) throw new Error("Falha ao buscar o índice.");
          return r.json();
        })
        .then((d: { dados: IndiceMensal[] }) => d.dados)
        .catch(() => {
          cacheIndices.delete(id);
          throw new Error("O Banco Central demorou a responder. Tente novamente em instantes.");
        }),
    );
  }
  return cacheIndices.get(id)!;
}

let cacheTaxas: Promise<TaxasAtuais> | null = null;

export function carregarTaxas(): Promise<TaxasAtuais> {
  if (!cacheTaxas) {
    cacheTaxas = fetch("/api/taxas", { signal: AbortSignal.timeout(20000) })
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao buscar as taxas.");
        return r.json() as Promise<TaxasAtuais>;
      })
      .catch((e) => {
        cacheTaxas = null;
        throw e;
      });
  }
  return cacheTaxas;
}
