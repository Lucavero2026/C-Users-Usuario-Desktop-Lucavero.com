import "server-only";

/**
 * Busca uma URL da API SGS do Banco Central com segurança:
 * - nunca guarda respostas ruins (o BCB às vezes devolve XML de erro);
 * - tenta de novo uma vez em caso de falha ou lentidão;
 * - mantém em memória o último resultado bom por 6 horas.
 * O cache da CDN fica por conta do Cache-Control das rotas.
 */

const TTL = 6 * 3600_000;
const memoria = new Map<string, { at: number; data: unknown[] }>();

async function tentativa(url: string): Promise<unknown[]> {
  const r = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (!r.ok) throw new Error(`BCB ${r.status}`);
  const data: unknown = JSON.parse(await r.text());
  if (!Array.isArray(data) || data.length === 0) throw new Error("BCB: resposta vazia");
  return data;
}

export async function fetchSgs<T>(url: string): Promise<T[]> {
  const hit = memoria.get(url);
  if (hit && Date.now() - hit.at < TTL) return hit.data as T[];
  let erro: unknown;
  for (let i = 0; i < 2; i++) {
    try {
      const data = await tentativa(url);
      memoria.set(url, { at: Date.now(), data });
      return data as T[];
    } catch (e) {
      erro = e;
    }
  }
  // Se o BCB falhar, devolve o último dado bom que tivermos, mesmo antigo.
  if (hit) return hit.data as T[];
  throw erro;
}
