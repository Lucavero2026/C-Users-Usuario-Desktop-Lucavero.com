/** Feriados nacionais via BrasilAPI, com cache simples em memória. */

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: string;
}

const cache = new Map<number, Holiday[]>();

export async function fetchHolidays(year: number): Promise<Holiday[]> {
  if (cache.has(year)) return cache.get(year)!;
  const r = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
  if (!r.ok) throw new Error("feriados indisponíveis");
  const data = (await r.json()) as Holiday[];
  cache.set(year, data);
  return data;
}

/** Conjunto de datas (YYYY-MM-DD) de feriados nos anos indicados. */
export async function holidaySet(years: number[]): Promise<Set<string>> {
  const all = await Promise.all(years.map((y) => fetchHolidays(y)));
  const set = new Set<string>();
  all.flat().forEach((h) => set.add(h.date));
  return set;
}
