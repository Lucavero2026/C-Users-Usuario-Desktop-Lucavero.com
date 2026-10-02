/**
 * Conteúdo editorial das páginas de ferramentas (SEO): um texto explicativo em
 * Markdown e perguntas frequentes (viram dados estruturados FAQPage).
 * Ferramentas sem entrada aqui simplesmente não exibem esse bloco.
 */

export interface ToolContent {
  /** Markdown exibido abaixo da ferramenta (use ## para subtítulos). */
  body: string;
  faq: { q: string; a: string }[];
}

export const TOOL_CONTENT: Record<string, ToolContent> = {
  "salario-liquido": {
    body: `## Como o salário líquido é calculado em 2026

O salário líquido é o bruto menos os descontos obrigatórios. A calculadora segue a ordem usada na folha de pagamento:

1. **INSS**: alíquotas progressivas de 7,5% a 14%, aplicadas por faixa, até o teto de R$ 8.475,55.
2. **IRRF**: a base é o salário menos o INSS e R$ 189,59 por dependente — ou o desconto simplificado de R$ 607,20, se for mais vantajoso.
3. **Redução da Lei 15.270/2025**: desde janeiro de 2026, quem ganha até **R$ 5.000** por mês não paga IR na fonte, e quem ganha até R$ 7.350 paga menos.

Vale-transporte (até 6% do salário), plano de saúde e outros descontos podem ser incluídos no campo "outros descontos".`,
    faq: [
      {
        q: "Quem ganha R$ 5.000 paga Imposto de Renda em 2026?",
        a: "Não na fonte. Com a Lei 15.270/2025, rendimentos tributáveis de até R$ 5.000 por mês têm o IRRF zerado por uma redução de até R$ 312,89.",
      },
      {
        q: "Qual o desconto do INSS em 2026?",
        a: "As alíquotas são 7,5% até R$ 1.621,00, 9% até R$ 2.902,84, 12% até R$ 4.354,27 e 14% até o teto de R$ 8.475,55, aplicadas de forma progressiva por faixa.",
      },
      {
        q: "O cálculo serve para estagiário ou autônomo?",
        a: "Não exatamente. Estagiários não contribuem ao INSS como empregados, e autônomos pagam INSS e IR por regras próprias. A calculadora é para empregados com carteira assinada (CLT).",
      },
    ],
  },
  irrf: {
    body: `## Tabela do IRRF 2026

| Base de cálculo mensal | Alíquota | Parcela a deduzir |
|---|---|---|
| Até R$ 2.428,80 | isento | — |
| De R$ 2.428,81 a R$ 2.826,65 | 7,5% | R$ 182,16 |
| De R$ 2.826,66 a R$ 3.751,05 | 15% | R$ 394,16 |
| De R$ 3.751,06 a R$ 4.664,68 | 22,5% | R$ 675,49 |
| Acima de R$ 4.664,68 | 27,5% | R$ 908,73 |

Depois da tabela, aplica-se a **redução da Lei 15.270/2025**, calculada sobre o rendimento bruto: até R$ 5.000 o imposto é zerado; entre R$ 5.000,01 e R$ 7.350 a redução é de R$ 978,62 − 0,133145 × rendimento.`,
    faq: [
      {
        q: "Como funciona a redução do IR para quem ganha até R$ 7.350?",
        a: "Calcula-se o imposto pela tabela normal e subtrai-se a redução: R$ 978,62 menos 0,133145 vezes o rendimento bruto. Quanto mais perto de R$ 7.350, menor a redução.",
      },
      {
        q: "O que é o desconto simplificado mensal?",
        a: "É um abatimento fixo de R$ 607,20 que substitui as deduções legais (INSS, dependentes). A fonte pagadora usa a opção que resultar em menos imposto.",
      },
    ],
  },
  "das-mei": {
    body: `## Valor do DAS do MEI em 2026

O DAS é a guia mensal única do MEI. Ela tem uma parte fixa de INSS (5% do salário mínimo, R$ 81,05 em 2026) mais R$ 1 de ICMS para comércio/indústria e R$ 5 de ISS para serviços:

| Atividade | Valor mensal |
|---|---|
| Comércio ou indústria | R$ 82,05 |
| Serviços | R$ 86,05 |
| Comércio e serviços | R$ 87,05 |

O vencimento é todo dia 20. Em atraso, há multa de 0,33% ao dia (até 20%) e juros pela Selic.`,
    faq: [
      {
        q: "Qual o valor do DAS MEI em 2026?",
        a: "R$ 82,05 para comércio ou indústria, R$ 86,05 para serviços e R$ 87,05 para quem exerce as duas atividades.",
      },
      {
        q: "O que acontece se eu não pagar o DAS?",
        a: "O débito acumula multa e juros, o tempo sem pagamento não conta para benefícios do INSS e, após o prazo, a dívida pode ser inscrita em dívida ativa.",
      },
    ],
  },
  "reajuste-de-aluguel": {
    body: `## Como funciona o reajuste do aluguel

Contratos de aluguel costumam ser reajustados **uma vez por ano**, no aniversário do contrato, pelo índice acumulado nos 12 meses anteriores. O índice está escrito no contrato — os mais comuns são o **IGP-M** (FGV) e o **IPCA** (IBGE).

A calculadora busca os índices oficiais no Banco Central, acumula os 12 meses e aplica sobre o aluguel atual. Exemplo: com aluguel de R$ 1.500 e índice acumulado de 4%, o novo aluguel fica em R$ 1.560.

## E se o índice der negativo?

Quando o acumulado é negativo, o aluguel poderia cair. Muitos contratos, porém, trazem cláusula mantendo o valor nesses casos. Leia a cláusula de reajuste e, na dúvida, negocie com o proprietário ou a imobiliária.`,
    faq: [
      {
        q: "Qual índice usar para reajustar o aluguel?",
        a: "O que estiver no contrato. Sem índice definido, é comum negociar o IPCA, que é a inflação oficial. A Lei do Inquilinato só exige que o reajuste seja anual.",
      },
      {
        q: "O proprietário pode reajustar antes de 12 meses?",
        a: "Não. Pela Lei do Inquilinato e pelo Plano Real, o reajuste por índice só pode ocorrer em períodos de no mínimo 12 meses.",
      },
      {
        q: "De onde vêm os índices da calculadora?",
        a: "Do Sistema Gerenciador de Séries Temporais do Banco Central (SGS), atualizado assim que IBGE e FGV divulgam cada mês.",
      },
    ],
  },
  "correcao-pela-inflacao": {
    body: `## Para que serve corrigir um valor pela inflação

A inflação faz o dinheiro perder poder de compra. Corrigir um valor mostra quanto ele valeria hoje — útil para comparar salários de anos diferentes, atualizar dívidas, pensões, indenizações ou simplesmente entender quanto os preços subiram.

A calculadora multiplica o valor pelo **fator acumulado** do índice escolhido (IPCA, INPC ou IGP-M) entre o mês inicial e o final, com dados oficiais do Banco Central.`,
    faq: [
      {
        q: "Qual a diferença entre IPCA, INPC e IGP-M?",
        a: "O IPCA é a inflação oficial, medida para famílias com renda de 1 a 40 salários mínimos. O INPC considera famílias de 1 a 5 salários mínimos e corrige benefícios do INSS. O IGP-M, da FGV, inclui preços no atacado e é tradicional em aluguéis.",
      },
      {
        q: "A correção inclui juros?",
        a: "Não. A calculadora faz apenas a correção monetária (inflação). Juros de mora ou remuneratórios devem ser calculados à parte.",
      },
    ],
  },
  "juros-compostos": {
    body: `## O que são juros compostos

Nos juros compostos, os juros de cada mês passam a render juros nos meses seguintes — os famosos "juros sobre juros". No começo a diferença é pequena, mas com o tempo o crescimento acelera, como uma bola de neve.

A fórmula para um valor sem aportes é **M = C × (1 + i)ⁿ**, em que C é o capital, i a taxa por período e n o número de períodos. Com aportes mensais, a calculadora simula mês a mês.

## Dica

O fator que mais pesa é o **tempo**. Começar cedo, mesmo com pouco, costuma render mais do que começar tarde com valores maiores.`,
    faq: [
      {
        q: "Como converter taxa anual em mensal?",
        a: "Use a equivalência de juros compostos: taxa mensal = (1 + taxa anual)^(1/12) − 1. Por exemplo, 12% ao ano equivalem a cerca de 0,95% ao mês, não 1%.",
      },
      {
        q: "A simulação desconta imposto de renda?",
        a: "Não. Para ver o rendimento líquido de CDB, LCI, Tesouro e poupança, use o comparador de investimentos.",
      },
    ],
  },
  "comparador-de-investimentos": {
    body: `## Como comparar investimentos de renda fixa

Para comparar de verdade, é preciso olhar o rendimento **líquido**, depois do imposto:

- **CDB e Tesouro Selic** pagam IR regressivo: 22,5% até 180 dias, 20% até 360, 17,5% até 720 e 15% acima disso.
- **LCI e LCA** são isentas de IR para pessoa física — por isso podem render menos "no papel" e ainda ganhar do CDB.
- **Poupança** é isenta, mas com a Selic acima de 8,5% ao ano rende só 0,5% ao mês + TR.

As taxas de CDI, Selic e poupança são preenchidas com os dados mais recentes do Banco Central.`,
    faq: [
      {
        q: "LCI a 90% do CDI é melhor que CDB a 100%?",
        a: "Depende do prazo. Como a LCI é isenta, 90% do CDI equivale a cerca de 106% do CDI num CDB resgatado após 2 anos (IR de 15%). Para prazos curtos, a vantagem da LCI é ainda maior.",
      },
      {
        q: "Esses investimentos são seguros?",
        a: "O Tesouro Selic é garantido pelo governo federal. CDB, LCI e LCA têm garantia do FGC até R$ 250 mil por CPF e por instituição. A poupança também tem cobertura do FGC.",
      },
    ],
  },
  "reserva-de-emergencia": {
    body: `## O que é a reserva de emergência

É um dinheiro guardado para imprevistos — perda de emprego, conserto do carro, problema de saúde — sem precisar recorrer a empréstimos ou ao cartão de crédito.

A regra prática é guardar de **3 a 12 meses do seu custo de vida**: quanto menos estável a renda, maior a reserva. Ela deve ficar num lugar seguro e com resgate imediato, como Tesouro Selic ou CDB com liquidez diária.`,
    faq: [
      {
        q: "Quantos meses de reserva eu preciso?",
        a: "Referência comum: 3 meses para servidores públicos, 6 meses para trabalhadores CLT e 12 meses para autônomos, MEIs e quem tem renda variável.",
      },
      {
        q: "Posso deixar a reserva na poupança?",
        a: "Pode, mas normalmente rende menos que Tesouro Selic ou CDB de liquidez diária a 100% do CDI, que têm a mesma facilidade de resgate.",
      },
    ],
  },
  "orcamento-50-30-20": {
    body: `## A regra 50/30/20

Popularizada pela senadora americana Elizabeth Warren, a regra divide a renda líquida em três partes:

- **50% para necessidades**: moradia, contas, alimentação, transporte, saúde.
- **30% para desejos**: lazer, restaurantes, compras, assinaturas.
- **20% para o futuro**: reserva de emergência, investimentos e quitação de dívidas.

É um ponto de partida simples para organizar o mês. Se as necessidades passam de 50%, ajuste primeiro os desejos — e tente manter algo, mesmo que pouco, para o futuro.`,
    faq: [
      {
        q: "Dívidas entram em qual grupo?",
        a: "Parcelas mínimas obrigatórias entram em necessidades. O valor extra para quitar dívidas mais rápido entra nos 20% do futuro.",
      },
      {
        q: "E se minha renda for muito apertada?",
        a: "Adapte as proporções, como 70/20/10. O importante é ter clareza de para onde vai o dinheiro e criar o hábito de guardar.",
      },
    ],
  },
  "juros-do-parcelamento": {
    body: `## Como descobrir os juros de um parcelamento

Muitas lojas anunciam "sem juros", mas oferecem desconto para pagamento à vista — o que significa que **os juros estão embutidos nas parcelas**. A calculadora compara o preço à vista com o total parcelado e encontra a taxa mensal que iguala os dois, pelo mesmo método usado em financiamentos (tabela Price).

Com a taxa em mãos, compare com o rendimento do seu dinheiro: se a aplicação rende menos que os juros do parcelamento, pagar à vista é melhor.`,
    faq: [
      {
        q: "O que é CET?",
        a: "Custo Efetivo Total: a taxa que inclui juros, tarifas, seguros e impostos de um crédito. Bancos são obrigados a informá-lo. Se você usar o valor líquido recebido e as parcelas reais, esta calculadora chega a uma estimativa do CET.",
      },
      {
        q: "Parcelado 'sem juros' sempre compensa?",
        a: "Se o preço à vista for igual ao parcelado, sim: você pode deixar o dinheiro rendendo enquanto paga. Se houver desconto à vista, calcule a taxa embutida antes de decidir.",
      },
    ],
  },
  "calculadora-de-porcentagem": {
    body: `## Fórmulas de porcentagem

- **X% de um valor**: valor × X ÷ 100. Ex.: 15% de 200 = 30.
- **Quanto X representa de Y**: X ÷ Y × 100. Ex.: 30 de 120 = 25%.
- **Aumento de X%**: valor × (1 + X/100). **Desconto**: valor × (1 − X/100).
- **Variação de A para B**: (B − A) ÷ A × 100.`,
    faq: [
      {
        q: "Um aumento de 10% seguido de um desconto de 10% volta ao valor original?",
        a: "Não. 100 + 10% = 110; 110 − 10% = 99. O desconto incide sobre um valor maior, então o resultado final fica 1% abaixo do original.",
      },
    ],
  },
  "viver-de-renda": {
    body: `## A regra dos 4%

Estudos com carteiras de investimentos de longo prazo indicam que retirar cerca de **4% do patrimônio por ano** tende a preservar o dinheiro por décadas. Assim, o patrimônio necessário é a renda anual desejada dividida por 0,04 — ou seja, **300 vezes a renda mensal**.

Para quem quer mais segurança, uma taxa de retirada de 3% a 3,5% é mais conservadora. A calculadora usa rentabilidade **real** (acima da inflação), então todos os valores estão em reais de hoje.`,
    faq: [
      {
        q: "Quanto preciso para ter R$ 5.000 por mês de renda passiva?",
        a: "Pela regra dos 4%, cerca de R$ 1,5 milhão (R$ 5.000 × 12 ÷ 0,04).",
      },
      {
        q: "Qual rentabilidade real usar?",
        a: "Valores entre 3% e 5% ao ano acima da inflação são referências conservadoras para uma carteira diversificada no Brasil.",
      },
    ],
  },
  financiamento: {
    body: `## Price ou SAC?

- **Price**: parcelas iguais do início ao fim. Mais previsível, mas você paga mais juros no total.
- **SAC**: a amortização é constante e as parcelas diminuem com o tempo. Começa mais cara, mas o total de juros é menor.

No financiamento imobiliário, o SAC é o mais usado. Para veículos e crédito pessoal, a Price é a regra.`,
    faq: [
      {
        q: "Vale a pena amortizar o financiamento antes?",
        a: "Em geral sim, principalmente quando os juros do financiamento são maiores que o rendimento do seu dinheiro aplicado. Amortizar reduz o saldo devedor e os juros futuros.",
      },
    ],
  },
  "rendimento-basico": {
    body: `## Quanto rende o seu dinheiro

O simulador aplica juros compostos mês a mês sobre o valor inicial e os aportes. As referências de poupança, CDI e Tesouro Selic são preenchidas com as taxas mais recentes do Banco Central.

Lembre-se de que CDB e Tesouro pagam imposto de renda sobre o rendimento. Para comparar o resultado líquido, use o comparador de investimentos.`,
    faq: [
      {
        q: "Quanto rende a poupança hoje?",
        a: "Com a Selic acima de 8,5% ao ano, a poupança rende 0,5% ao mês mais a TR. O valor mensal atualizado é carregado automaticamente no simulador.",
      },
    ],
  },
};
