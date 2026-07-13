import "server-only";

/**
 * Limitador simples em memória (por instância) para conter custo das rotas de IA.
 * Não é distribuído — para produção séria, trocar por Upstash/Redis. Serve como
 * primeira barreira contra abuso no "começo controlado".
 */
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(
  key: string,
  { limit = 12, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) return { ok: false, remaining: 0 };
  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}

export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || "anon";
}
