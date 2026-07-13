/**
 * Conteúdo do blog. Cada post é um objeto com corpo em markdown.
 * Para publicar um artigo novo, acrescente um item em POSTS.
 */

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  emoji: string;
  tag: string;
  /** slugs de ferramentas relacionadas (opcional) */
  related?: string[];
  body: string;
}

export const POSTS: Post[] = [
  {
    slug: "como-calcular-salario-liquido",
    title: "Como calcular seu salário líquido (e entender os descontos)",
    description:
      "Aprenda a descobrir quanto realmente cai na conta depois de INSS e Imposto de Renda, com uma calculadora gratuita.",
    date: "2026-07-13",
    emoji: "💰",
    tag: "Ferramentas",
    related: ["salario-liquido", "irrf", "ferias-e-decimo-terceiro"],
    body: `Quando você recebe uma proposta de emprego com um salário "bruto", esse **não** é o valor que cai na sua conta. Entre o bruto e o líquido existem descontos obrigatórios. Entender isso ajuda a planejar o orçamento e a negociar melhor.

## Os principais descontos

- **INSS**: a contribuição para a Previdência, calculada por faixas progressivas sobre o salário.
- **IRRF (Imposto de Renda Retido na Fonte)**: incide sobre o que sobra depois do INSS e de deduções, também por faixas.
- **Outros**: vale-transporte, plano de saúde e adiantamentos podem ser descontados, dependendo do seu contrato.

## Como calcular na prática

Em vez de fazer as contas na mão, use a nossa [calculadora de salário líquido](/ferramentas/salario-liquido). Basta informar o salário bruto e o número de dependentes que ela mostra, passo a passo, quanto sai de INSS, de IRRF e quanto sobra no fim.

> Dica: a ferramenta escolhe automaticamente o desconto de IR mais vantajoso (simplificado ou por dependentes).

## E as férias e o 13º?

Esses valores seguem regras próprias. Veja a [calculadora de férias e 13º](/ferramentas/ferias-e-decimo-terceiro) para estimar quanto você tem a receber.

Lembre-se: os resultados são estimativas. Para valores oficiais, confira seu holerite e, em caso de dúvida, fale com o RH da empresa.`,
  },
  {
    slug: "como-gerar-pix-copia-e-cola",
    title: "Como gerar um Pix Copia e Cola para receber pagamentos",
    description:
      "Crie um código Pix e um QR Code em segundos para receber de clientes, mesmo sem maquininha.",
    date: "2026-07-13",
    emoji: "📲",
    tag: "Ferramentas",
    related: ["pix-copia-e-cola", "qr-code", "recibo-online"],
    body: `Se você é autônomo, freelancer ou vende algo de vez em quando, o Pix é a forma mais rápida de receber — sem taxas e sem maquininha. E dá para criar uma cobrança pronta em segundos.

## O que é o "Copia e Cola"

É um código (um texto grande) que carrega os dados da sua cobrança: sua chave Pix, seu nome, a cidade e, se quiser, o valor. Quem for te pagar só cola esse código no app do banco e confirma.

## Passo a passo

1. Abra o [gerador de Pix](/ferramentas/pix-copia-e-cola).
2. Escolha o tipo de chave (CPF, e-mail, telefone ou aleatória) e informe a sua.
3. Digite seu nome e a cidade.
4. Se quiser, coloque o valor e uma descrição.
5. Clique em **Gerar Pix**: você recebe o código Copia e Cola **e** um QR Code para baixar.

## Onde usar

- Mande o código pelo WhatsApp junto com um [link direto de conversa](/ferramentas/link-whatsapp).
- Cole o QR Code em um anúncio ou imprima para o balcão.
- Emita um [recibo](/ferramentas/recibo-online) depois que o pagamento cair.

Tudo gratuito e sem cadastro.`,
  },
  {
    slug: "cadunico-e-programas-sociais",
    title: "CadÚnico: a porta de entrada para os programas sociais",
    description:
      "Entenda o que é o Cadastro Único, quem pode se inscrever e como ele dá acesso a benefícios como Bolsa Família, Tarifa Social e mais.",
    date: "2026-07-13",
    emoji: "🤝",
    tag: "Programas sociais",
    related: ["consulte-seus-direitos"],
    body: `O **Cadastro Único** (CadÚnico) é um registro do governo federal que identifica as famílias de baixa renda no Brasil. Ele é a **porta de entrada** para dezenas de programas sociais: quem está no CadÚnico pode ter acesso a benefícios como Bolsa Família, Tarifa Social de Energia, ID Jovem e outros.

## Quem pode se inscrever

Podem se cadastrar famílias com renda mensal de até **meio salário mínimo por pessoa**, ou renda total de até três salários mínimos. Famílias em situação de vulnerabilidade também podem ser incluídas.

## Como fazer o cadastro

1. Reúna os documentos de todos da família: CPF ou título de eleitor do responsável, e documentos dos demais (certidão de nascimento, RG, CPF).
2. Procure o **CRAS** (Centro de Referência de Assistência Social) mais próximo da sua casa.
3. Um entrevistador vai registrar os dados da família. Guarde o **NIS** (Número de Identificação Social) gerado.
4. Mantenha o cadastro **atualizado** sempre que algo mudar (endereço, renda, nascimento).

## Alguns programas que dependem do CadÚnico

- **Bolsa Família** — transferência de renda para famílias em situação de pobreza.
- **Tarifa Social de Energia Elétrica** — desconto na conta de luz.
- **ID Jovem** — meia-entrada e vagas gratuitas em transporte interestadual.
- **Isenção de taxa em concursos públicos**.

> Precisa checar um direito específico? Descreva sua situação no [Consulte seus direitos](/ferramentas/consulte-seus-direitos) e receba uma orientação inicial.

Este conteúdo é informativo. As regras podem mudar — confirme sempre nos canais oficiais (site do Governo Federal e no CRAS da sua cidade).`,
  },
  {
    slug: "como-contestar-multa-e-cobranca",
    title: "Recebeu uma multa ou cobrança indevida? Veja como contestar",
    description:
      "Um guia prático para questionar multas de trânsito e cobranças que você não reconhece — com um gerador de recurso por IA.",
    date: "2026-07-13",
    emoji: "⚖️",
    tag: "Direitos",
    related: ["requerimentos-e-recursos", "decodificador-juridiques", "consulte-seus-direitos"],
    body: `Levar uma multa ou ver uma cobrança que você não reconhece na fatura é frustrante — mas você tem o direito de contestar. O segredo é agir dentro do prazo e apresentar um pedido bem escrito.

## 1. Entenda o que está sendo cobrado

Textos oficiais costumam ser cheios de "juridiquês". Cole a notificação no [decodificador de juridiquês](/ferramentas/decodificador-juridiques) para entender, em português claro, o que ela diz e quais são os prazos.

## 2. Reúna as provas

- Comprovantes, prints, e-mails, fotos.
- Datas e protocolos de atendimento.
- Qualquer documento que mostre que a cobrança está errada.

## 3. Escreva o recurso ou a contestação

Um pedido formal tem mais chances de ser aceito. Use o [gerador de requerimentos e recursos](/ferramentas/requerimentos-e-recursos): você descreve a situação e a IA monta um documento estruturado, com fundamentação, pronto para imprimir e enviar.

## 4. Envie no canal certo e dentro do prazo

- **Multas de trânsito**: siga as instruções da notificação (defesa prévia ou recurso à JARI), respeitando a data-limite.
- **Cobranças de empresas**: registre no SAC, guarde o protocolo e, se não resolver, abra reclamação no **Procon** ou no consumidor.gov.br.

Ficou em dúvida sobre seus direitos? O [Consulte seus direitos](/ferramentas/consulte-seus-direitos) dá uma orientação inicial com base na lei brasileira.

*Conteúdo informativo — não substitui orientação jurídica profissional.*`,
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export const SORTED_POSTS = [...POSTS].sort((a, b) =>
  b.date.localeCompare(a.date),
);
