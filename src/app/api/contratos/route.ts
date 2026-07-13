import { NextResponse } from "next/server";
import { askText, aiConfigured } from "@/lib/ai";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `Você é um assistente jurídico do site Lucavero Multiserviços que redige contratos e recibos simples, claros e juridicamente bem estruturados, conforme a legislação brasileira. A partir das informações do usuário, gere um documento pronto para ser impresso e assinado.

Regras de redação:
- Português do Brasil, tom formal porém claro.
- Estruture com: título; qualificação das partes (CONTRATANTE/CONTRATADO ou VENDEDOR/COMPRADOR/LOCADOR/LOCATÁRIO conforme o caso); cláusulas numeradas (objeto, valor e forma de pagamento, prazo/vigência, obrigações das partes, rescisão, foro); local e data; e linhas de assinatura das duas partes e de duas testemunhas.
- Use SOMENTE os dados fornecidos. Onde faltar um dado essencial, deixe um espaço editável no formato [preencher: descrição].
- Não invente valores, datas ou nomes.
- Saída em markdown limpo (títulos com ##, cláusulas em parágrafos numerados). Não inclua comentários fora do contrato.
- Ao final do documento, acrescente em itálico: *Modelo gerado automaticamente. Recomenda-se revisão por um advogado antes da assinatura.*`;

const TIPOS: Record<string, string> = {
  servicos: "Contrato de prestação de serviços",
  aluguel: "Contrato de locação (aluguel)",
  "aluguel-vaga": "Contrato de aluguel de vaga de garagem",
  "venda-bem": "Contrato de compra e venda de bem (ex.: veículo, celular)",
  emprestimo: "Contrato de empréstimo de dinheiro entre pessoas",
  recibo: "Recibo de pagamento / quitação",
  confidencialidade: "Termo de confidencialidade (NDA) simples",
};

export async function POST(req: Request) {
  if (!aiConfigured()) {
    return NextResponse.json(
      { error: "A ferramenta de IA ainda não está ativada." },
      { status: 503 },
    );
  }
  const { ok } = rateLimit(`contrato:${clientKey(req)}`, { limit: 6 });
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

  const tipoNome = TIPOS[body.tipo] || TIPOS.servicos;
  const linhas = [
    `Tipo de documento: ${tipoNome}`,
    body.parte1 && `Parte 1 (contratante/vendedor/locador): ${body.parte1}`,
    body.doc1 && `Documento da parte 1: ${body.doc1}`,
    body.parte2 && `Parte 2 (contratado/comprador/locatário): ${body.parte2}`,
    body.doc2 && `Documento da parte 2: ${body.doc2}`,
    body.objeto && `Objeto / descrição: ${body.objeto}`,
    body.valor && `Valor: ${body.valor}`,
    body.pagamento && `Forma de pagamento: ${body.pagamento}`,
    body.prazo && `Prazo / vigência: ${body.prazo}`,
    body.cidade && `Cidade/foro: ${body.cidade}`,
    body.extra && `Condições adicionais: ${body.extra}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!body.parte1 || !body.objeto) {
    return NextResponse.json(
      { error: "Preencha ao menos as partes e o objeto do contrato." },
      { status: 400 },
    );
  }

  try {
    const documento = await askText({
      system: SYSTEM,
      user: `Gere o documento com base nestas informações:\n\n${linhas.slice(0, 4000)}`,
      maxTokens: 4000,
    });
    return NextResponse.json({ documento, titulo: tipoNome });
  } catch (e) {
    console.error("contratos erro:", e);
    return NextResponse.json(
      { error: "Não consegui gerar agora. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
