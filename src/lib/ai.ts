import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Cliente central da IA (Claude). Usado SOMENTE em rotas server (nunca no client).
 * Modelo configurável por env var — troque para `claude-haiku-4-5` se quiser
 * reduzir custo (~5x mais barato) mantendo boa qualidade.
 */

export const AI_MODEL = process.env.LUCAVERO_AI_MODEL || "claude-opus-4-8";

let client: Anthropic | null = null;

export function getAI(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY não configurada.");
  }
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export function aiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Chamada simples: system + prompt do usuário → texto de resposta.
 * Sem "thinking" para manter latência baixa (ideal para as ferramentas do site).
 */
export async function askText(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const res = await getAI().messages.create({
    model: AI_MODEL,
    max_tokens: params.maxTokens ?? 4000,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/** Extrai o primeiro bloco JSON de um texto (tolerante a cercas ```json). */
export function extractJSON<T = unknown>(text: string): T | null {
  const cleaned = text.replace(/```json/gi, "```").trim();
  const fenced = cleaned.match(/```\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : cleaned;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
