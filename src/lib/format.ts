/** Utilidades de formatação para o padrão brasileiro. */

export const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  if (!isFinite(value)) return "—";
  return BRL.format(value);
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(value: number, digits = 2): string {
  return `${formatNumber(value, digits)}%`;
}

/** Converte texto digitado ("1.234,56" ou "1234.56") em número. */
export function parseNumber(input: string): number {
  if (!input) return NaN;
  const cleaned = input
    .toString()
    .trim()
    .replace(/[^\d.,-]/g, "");
  // Se tem vírgula, assume padrão BR (vírgula = decimal).
  if (cleaned.includes(",")) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }
  return parseFloat(cleaned);
}

export function onlyDigits(input: string): string {
  return (input || "").replace(/\D/g, "");
}
