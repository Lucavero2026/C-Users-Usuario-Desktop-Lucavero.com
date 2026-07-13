import { NextResponse } from "next/server";
import { askText, aiConfigured } from "@/lib/ai";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 45;

const SYSTEM = `Você é um orientador de direitos do cidadão brasileiro, do site Lucavero Multiserviços. O usuário descreve uma situação ou dúvida e você explica os direitos aplicáveis de forma clara e prática, com base na legislação brasileira (CLT, CDC, CF, leis específicas).

Formato (markdown simples):
## Resposta direta
(1-3 frases respondendo objetivamente)

## Seus direitos
(explicação clara; cite a base legal em linguagem acessível, ex: "pelo Código de Defesa do Consumidor (CDC)")

## O que fazer
(passos práticos: onde reclamar, prazos, órgãos como Procon, INSS, sindicato, Defensoria)

Regras:
- Não invente números de lei nem artigos específicos se não tiver certeza; prefira citar a lei pelo nome.
- Não dê valores exatos de indenização; explique como funciona.
- Português do Brasil, tom acolhedor.
- Termine sempre com, em itálico: *Orientação informativa e gratuita. Para casos concretos, procure um advogado ou a Defensoria Pública.*`;

export async function POST(req: Request) {
  if (!aiConfigured()) {
    return NextResponse.json(
      { error: "A ferramenta de IA ainda não está ativada." },
      { status: 503 },
    );
  }
  const { ok } = rateLimit(`direitos:${clientKey(req)}`, { limit: 8 });
  if (!ok) {
    return NextResponse.json(
      { error: "Muitas perguntas seguidas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  let duvida = "";
  try {
    const body = await req.json();
    duvida = String(body?.duvida || "").slice(0, 3000);
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  if (duvida.trim().length < 10) {
    return NextResponse.json(
      { error: "Descreva sua dúvida com um pouco mais de detalhe." },
      { status: 400 },
    );
  }

  try {
    const resposta = await askText({
      system: SYSTEM,
      user: duvida,
      maxTokens: 1800,
    });
    return NextResponse.json({ resposta });
  } catch (e) {
    console.error("direitos erro:", e);
    return NextResponse.json(
      { error: "Não consegui responder agora. Tente novamente." },
      { status: 500 },
    );
  }
}
