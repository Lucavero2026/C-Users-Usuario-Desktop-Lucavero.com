import { NextResponse } from "next/server";
import { askText, aiConfigured } from "@/lib/ai";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 45;

const SYSTEM = `Você é um tradutor de "juridiquês" para português claro, do site Lucavero Multiserviços. O usuário cola um texto jurídico ou burocrático (notificação, multa, cláusula de contrato, intimação) e você explica de forma simples, acolhedora e direta.

Formato da resposta (use markdown simples):
## Em resumo
(1-2 frases dizendo o que aquilo significa na prática)

## O que está dizendo
(explicação em linguagem cotidiana, sem termos técnicos; se usar um termo jurídico, explique entre parênteses)

## O que você pode fazer
(passos práticos e prazos, se houver)

Regras:
- Nunca invente fatos, valores ou prazos que não estejam no texto.
- Deixe claro quando algo é um prazo importante.
- Ao final, inclua sempre uma linha em itálico: *Isto é uma explicação informativa e não substitui a orientação de um advogado.*
- Responda em português do Brasil.`;

export async function POST(req: Request) {
  if (!aiConfigured()) {
    return NextResponse.json(
      { error: "A ferramenta de IA ainda não está ativada." },
      { status: 503 },
    );
  }
  const { ok } = rateLimit(`juri:${clientKey(req)}`, { limit: 8 });
  if (!ok) {
    return NextResponse.json(
      { error: "Muitas solicitações. Aguarde um minuto e tente novamente." },
      { status: 429 },
    );
  }

  let texto = "";
  try {
    const body = await req.json();
    texto = String(body?.texto || "").slice(0, 8000);
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  if (texto.trim().length < 15) {
    return NextResponse.json(
      { error: "Cole um trecho um pouco maior para eu conseguir explicar." },
      { status: 400 },
    );
  }

  try {
    const explicacao = await askText({
      system: SYSTEM,
      user: `Explique este texto:\n\n"""${texto}"""`,
      maxTokens: 1800,
    });
    return NextResponse.json({ explicacao });
  } catch (e) {
    console.error("juridiques erro:", e);
    return NextResponse.json(
      { error: "Não consegui processar agora. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
