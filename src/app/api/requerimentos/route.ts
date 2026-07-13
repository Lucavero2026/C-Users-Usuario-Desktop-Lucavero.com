import { NextResponse } from "next/server";
import { askText, aiConfigured } from "@/lib/ai";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const TIPOS: Record<string, string> = {
  "multa-transito": "Recurso/defesa contra multa de trânsito",
  "cobranca-indevida": "Contestação de cobrança indevida (ex.: TV a cabo, internet, banco)",
  reembolso: "Pedido formal de reembolso/estorno",
  requerimento: "Requerimento administrativo genérico",
  reclamacao: "Reclamação formal (Procon/empresa)",
};

const SYSTEM = `Você redige documentos formais para o cidadão brasileiro (recursos, contestações, requerimentos, reclamações), do site Lucavero Multiserviços. A partir da situação descrita, escreva um documento pronto para envio, respeitoso e bem fundamentado.

Regras:
- Português do Brasil, formal e educado.
- Estruture com: cabeçalho (destinatário/órgão), qualificação do requerente, exposição dos fatos, fundamentação (direitos aplicáveis em linguagem acessível, ex.: CDC), o pedido claro, e fecho com local/data e assinatura.
- Use apenas os dados fornecidos; onde faltar, deixe [preencher: descrição].
- Não invente números de processo, protocolos ou artigos de lei específicos.
- Saída em markdown limpo, sem comentários fora do documento.
- Ao final, em itálico: *Modelo informativo. Revise os dados e, em caso de dúvida, procure orientação jurídica.*`;

export async function POST(req: Request) {
  if (!aiConfigured()) {
    return NextResponse.json(
      { error: "A ferramenta de IA ainda não está ativada." },
      { status: 503 },
    );
  }
  const { ok } = rateLimit(`req:${clientKey(req)}`, { limit: 6 });
  if (!ok) {
    return NextResponse.json(
      { error: "Muitas gerações seguidas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  let body: Record<string, string> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const tipoNome = TIPOS[body.tipo] || TIPOS.requerimento;
  const situacao = String(body.situacao || "").slice(0, 4000);
  if (situacao.trim().length < 15) {
    return NextResponse.json(
      { error: "Descreva a situação com um pouco mais de detalhe." },
      { status: 400 },
    );
  }

  const dados = [
    `Tipo de documento: ${tipoNome}`,
    body.nome && `Nome do requerente: ${body.nome}`,
    body.doc && `Documento (CPF): ${body.doc}`,
    body.destinatario && `Destinatário/órgão: ${body.destinatario}`,
    body.cidade && `Cidade: ${body.cidade}`,
    `Situação/fatos: ${situacao}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const documento = await askText({
      system: SYSTEM,
      user: `Gere o documento com base nestas informações:\n\n${dados}`,
      maxTokens: 3000,
    });
    return NextResponse.json({ documento, titulo: tipoNome });
  } catch (e) {
    console.error("requerimentos erro:", e);
    return NextResponse.json(
      { error: "Não consegui gerar agora. Tente novamente." },
      { status: 500 },
    );
  }
}
