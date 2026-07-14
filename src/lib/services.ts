/**
 * Registro central de serviços do Lucavero Multiserviços.
 * Fonte única de verdade para: homepage, busca inteligente,
 * grade /ferramentas, páginas de categoria, sitemap e SEO.
 *
 * Para adicionar um serviço novo, basta acrescentar um item aqui.
 */

export type CategoryId =
  | "financas"
  | "documentos"
  | "trabalhista"
  | "consultas"
  | "utilidades"
  | "direitos";

export type ServiceStatus = "live" | "soon";

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  /** var CSS de cor (definida em globals.css) */
  color: string;
  colorSoft: string;
  /** nome do ícone lucide */
  icon: string;
}

export interface Service {
  slug: string;
  name: string;
  short: string;
  description: string;
  category: CategoryId;
  icon: string;
  status: ServiceStatus;
  /** usa a API de IA (Claude) */
  ai?: boolean;
  /** termos para a busca entender a intenção */
  keywords: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: "financas",
    name: "Finanças pessoais",
    description: "Calculadoras de dinheiro, juros, parcelamento e reajustes.",
    color: "var(--c-financas)",
    colorSoft: "var(--c-financas-soft)",
    icon: "PiggyBank",
  },
  {
    id: "documentos",
    name: "Documentos & Contratos",
    description: "Gere contratos, recibos e documentos prontos — com ajuda de IA.",
    color: "var(--c-documentos)",
    colorSoft: "var(--c-documentos-soft)",
    icon: "FileText",
  },
  {
    id: "trabalhista",
    name: "Trabalho & Salário",
    description: "Salário líquido, férias, 13º, rescisão e hora de trabalho.",
    color: "var(--c-trabalhista)",
    colorSoft: "var(--c-trabalhista-soft)",
    icon: "Briefcase",
  },
  {
    id: "consultas",
    name: "Consultas",
    description: "CEP, CNPJ, bancos, feriados e mais — dados públicos na hora.",
    color: "var(--c-consultas)",
    colorSoft: "var(--c-consultas-soft)",
    icon: "Search",
  },
  {
    id: "utilidades",
    name: "Utilidades",
    description: "Pix, QR Code, links de WhatsApp, encurtador e conversores.",
    color: "var(--c-utilidades)",
    colorSoft: "var(--c-utilidades-soft)",
    icon: "Wrench",
  },
  {
    id: "direitos",
    name: "Direitos & Jurídico",
    description: "Entenda o 'juridiquês', consulte direitos e conteste cobranças.",
    color: "var(--c-direitos)",
    colorSoft: "var(--c-direitos-soft)",
    icon: "Scale",
  },
];

export const SERVICES: Service[] = [
  // ---------------- Finanças ----------------
  {
    slug: "conversor-de-moedas",
    name: "Conversor de moedas",
    short: "Converta valores entre moedas com cotação atual.",
    description:
      "Converta rapidamente entre real, dólar, euro e outras moedas usando cotações atualizadas.",
    category: "financas",
    icon: "ArrowLeftRight",
    status: "live",
    keywords: ["dolar", "euro", "cambio", "cotacao", "moeda", "converter dinheiro"],
  },
  {
    slug: "juros-e-multa-de-boleto",
    name: "Juros e multa de boleto",
    short: "Calcule quanto pagar num boleto atrasado.",
    description:
      "Descubra o valor corrigido de um boleto vencido com multa e juros de mora por dia de atraso.",
    category: "financas",
    icon: "Receipt",
    status: "live",
    keywords: ["boleto atrasado", "multa", "juros de mora", "conta vencida", "atraso"],
  },
  {
    slug: "reajuste-de-aluguel",
    name: "Reajuste de aluguel (IPCA/IGP-M)",
    short: "Reajuste o aluguel pelo índice do contrato.",
    description:
      "Calcule o novo valor do aluguel corrigido por IPCA, IGP-M ou INPC no período do contrato.",
    category: "financas",
    icon: "Home",
    status: "soon",
    keywords: ["aluguel", "reajuste", "ipca", "igpm", "inpc", "correcao aluguel"],
  },
  {
    slug: "correcao-pela-inflacao",
    name: "Correção pela inflação",
    short: "Atualize um valor antigo pela inflação.",
    description:
      "Veja quanto vale hoje um valor do passado, corrigido pelos principais índices de inflação.",
    category: "financas",
    icon: "TrendingUp",
    status: "soon",
    keywords: ["inflacao", "corrigir valor", "poder de compra", "atualizar valor"],
  },
  {
    slug: "simulador-de-parcelamento",
    name: "À vista ou parcelado?",
    short: "Descubra se compensa pagar à vista ou parcelar.",
    description:
      "Compare o desconto à vista com o custo de parcelar e veja qual opção realmente vale a pena.",
    category: "financas",
    icon: "CreditCard",
    status: "live",
    keywords: ["parcelar", "a vista", "desconto", "antecipar parcela", "financiamento", "sac", "price"],
  },
  {
    slug: "rendimento-basico",
    name: "Simulador de rendimento",
    short: "Simule quanto seu dinheiro rende.",
    description:
      "Estime o rendimento de uma aplicação simples (poupança/CDI) ao longo do tempo.",
    category: "financas",
    icon: "LineChart",
    status: "live",
    keywords: ["rendimento", "poupanca", "cdi", "investir", "juros compostos"],
  },

  // ---------------- Trabalhista ----------------
  {
    slug: "salario-liquido",
    name: "Salário líquido",
    short: "Do bruto ao líquido, com INSS e IRRF.",
    description:
      "Calcule quanto você recebe de fato: descontos de INSS, IRRF e dependentes sobre o salário bruto.",
    category: "trabalhista",
    icon: "Wallet",
    status: "live",
    keywords: ["salario liquido", "inss", "irrf", "desconto salario", "holerite", "bruto liquido"],
  },
  {
    slug: "irrf",
    name: "Imposto de Renda na Fonte (IRRF)",
    short: "Calcule o IRRF sobre um pagamento.",
    description:
      "Veja o desconto de Imposto de Renda Retido na Fonte conforme a tabela vigente.",
    category: "trabalhista",
    icon: "Percent",
    status: "live",
    keywords: ["irrf", "imposto de renda", "retido na fonte", "desconto ir"],
  },
  {
    slug: "ferias-e-decimo-terceiro",
    name: "Férias e 13º salário",
    short: "Estime férias e décimo terceiro.",
    description:
      "Calcule o valor estimado das suas férias (com 1/3) e do 13º salário. Valores estimativos.",
    category: "trabalhista",
    icon: "Sun",
    status: "live",
    keywords: ["ferias", "13 salario", "decimo terceiro", "terco de ferias"],
  },
  {
    slug: "rescisao-trabalhista",
    name: "Acerto / rescisão trabalhista",
    short: "Estime quanto você tem a receber.",
    description:
      "Calcule uma estimativa da rescisão: saldo de salário, aviso, férias, 13º proporcional e multa do FGTS.",
    category: "trabalhista",
    icon: "FileMinus",
    status: "live",
    keywords: ["rescisao", "acerto trabalhista", "demissao", "fui demitido", "verbas rescisorias", "fgts"],
  },
  {
    slug: "valor-da-hora",
    name: "Valor da sua hora de trabalho",
    short: "Quanto cobrar por hora como freelancer.",
    description:
      "Descubra quanto cobrar por hora com base nos seus custos fixos, horas trabalhadas e meta de salário.",
    category: "trabalhista",
    icon: "Clock",
    status: "live",
    keywords: ["valor da hora", "freelancer", "quanto cobrar", "autonomo", "preco por hora"],
  },

  // ---------------- Documentos ----------------
  {
    slug: "gerador-de-contratos",
    name: "Gerador de contratos (IA)",
    short: "Responda um formulário, receba o contrato pronto.",
    description:
      "A IA monta um contrato ou recibo juridicamente estruturado a partir de respostas simples, pronto em PDF.",
    category: "documentos",
    icon: "FileSignature",
    status: "live",
    ai: true,
    keywords: ["contrato", "recibo", "gerar contrato", "aluguel de vaga", "venda de celular", "documento pdf"],
  },
  {
    slug: "recibo-online",
    name: "Emissor de recibo",
    short: "Gere um recibo e salve em PDF.",
    description:
      "Crie recibos de pagamento com valor, descrição e assinatura, e baixe em PDF na hora.",
    category: "documentos",
    icon: "ReceiptText",
    status: "live",
    keywords: ["recibo", "recibo de pagamento", "gerar recibo", "comprovante"],
  },
  {
    slug: "requerimentos-e-recursos",
    name: "Requerimentos e recursos (IA)",
    short: "Conteste multas e cobranças indevidas.",
    description:
      "Modelos gerados por IA para contestar multas de trânsito, cobranças indevidas e pedir reembolsos.",
    category: "documentos",
    icon: "Gavel",
    status: "live",
    ai: true,
    keywords: ["recurso de multa", "cobranca indevida", "reembolso", "requerimento", "contestar"],
  },

  // ---------------- Consultas ----------------
  {
    slug: "consulta-cep",
    name: "Consulta de CEP",
    short: "Endereço completo a partir do CEP.",
    description:
      "Digite um CEP e veja logradouro, bairro, cidade e estado. Também busca o CEP pelo endereço.",
    category: "consultas",
    icon: "MapPin",
    status: "live",
    keywords: ["cep", "endereco", "buscar cep", "codigo postal"],
  },
  {
    slug: "consulta-cnpj",
    name: "Consulta de CNPJ",
    short: "Dados públicos de uma empresa.",
    description:
      "Consulte razão social, situação cadastral, endereço e atividades de um CNPJ.",
    category: "consultas",
    icon: "Building2",
    status: "live",
    keywords: ["cnpj", "empresa", "razao social", "situacao cadastral", "consultar empresa"],
  },
  {
    slug: "consulta-de-bancos",
    name: "Bancos por código",
    short: "Descubra o banco pelo código (ISPB/COMPE).",
    description:
      "Encontre o nome do banco a partir do código de compensação ou pesquise pelo nome.",
    category: "consultas",
    icon: "Landmark",
    status: "live",
    keywords: ["banco", "codigo do banco", "ispb", "compe", "lista de bancos"],
  },
  {
    slug: "feriados",
    name: "Calendário de feriados",
    short: "Feriados nacionais do ano.",
    description:
      "Consulte os feriados nacionais (e pontos facultativos) de qualquer ano.",
    category: "consultas",
    icon: "CalendarDays",
    status: "live",
    keywords: ["feriados", "feriado nacional", "calendario", "ponto facultativo"],
  },
  {
    slug: "verificador-de-marca",
    name: "Verificador de marca (INPI)",
    short: "Veja se um nome de marca é viável.",
    description:
      "Busca inteligente para checar se o nome de uma marca já parece registrado no INPI.",
    category: "consultas",
    icon: "BadgeCheck",
    status: "soon",
    ai: true,
    keywords: ["marca", "inpi", "registro de marca", "nome disponivel", "registrar marca"],
  },

  // ---------------- Utilidades ----------------
  {
    slug: "pix-copia-e-cola",
    name: "Gerador de Pix (Copia e Cola + QR)",
    short: "Crie uma cobrança Pix em segundos.",
    description:
      "Gere o código Pix Copia e Cola e o QR Code para receber pagamentos como autônomo.",
    category: "utilidades",
    icon: "QrCode",
    status: "live",
    keywords: ["pix", "copia e cola", "qr code pix", "cobranca pix", "receber pix"],
  },
  {
    slug: "link-whatsapp",
    name: "Link para WhatsApp",
    short: "Gere um link direto pro seu número.",
    description:
      "Cole o número e receba um link wa.me que abre a conversa no WhatsApp, com mensagem opcional.",
    category: "utilidades",
    icon: "MessageCircle",
    status: "live",
    keywords: ["whatsapp", "link whatsapp", "wa.me", "botao whatsapp"],
  },
  {
    slug: "qr-code",
    name: "Criador e leitor de QR Code",
    short: "Gere ou leia QR Codes.",
    description:
      "Crie QR Codes para links, textos ou contatos, e leia QR Codes pela câmera ou por imagem.",
    category: "utilidades",
    icon: "ScanLine",
    status: "live",
    keywords: ["qr code", "gerar qr", "ler qr", "leitor de qr code", "camera"],
  },
  {
    slug: "encurtador-de-links",
    name: "Encurtador de links",
    short: "Deixe um link longo curtinho.",
    description:
      "Transforme URLs longas em links curtos e fáceis de compartilhar, sem anúncios invasivos.",
    category: "utilidades",
    icon: "Link2",
    status: "soon",
    keywords: ["encurtar link", "url curta", "encurtador", "short link"],
  },
  {
    slug: "contador-de-dias-uteis",
    name: "Contador de dias úteis",
    short: "Conte dias úteis entre duas datas.",
    description:
      "Calcule quantos dias úteis existem entre duas datas, descontando fins de semana e feriados.",
    category: "utilidades",
    icon: "CalendarCheck",
    status: "live",
    keywords: ["dias uteis", "contar dias", "prazo", "entre datas", "dias corridos"],
  },
  {
    slug: "gerador-de-documentos",
    name: "Gerador e validador (CPF/CNPJ/PIS)",
    short: "Gere e valide documentos para testes.",
    description:
      "Gere e valide números de CPF, CNPJ e PIS válidos para testar sistemas. Ferramenta para devs.",
    category: "utilidades",
    icon: "IdCard",
    status: "live",
    keywords: ["gerar cpf", "validar cpf", "cnpj", "pis", "gerador de documentos", "teste", "dev"],
  },

  // ---------------- Direitos ----------------
  {
    slug: "decodificador-juridiques",
    name: "Decodificador de juridiquês (IA)",
    short: "Cole um texto jurídico e entenda em português claro.",
    description:
      "Cole uma notificação, multa ou cláusula complicada e a IA explica em linguagem simples o que significa.",
    category: "direitos",
    icon: "Languages",
    status: "live",
    ai: true,
    keywords: ["juridiques", "entender contrato", "notificacao judicial", "clausula", "traduzir juridico"],
  },
  {
    slug: "consulte-seus-direitos",
    name: "Consulte seus direitos (IA)",
    short: "Tire dúvidas com base na lei.",
    description:
      "Descreva sua situação e receba uma orientação com embasamento nas leis brasileiras. Não substitui um advogado.",
    category: "direitos",
    icon: "BookOpenCheck",
    status: "live",
    ai: true,
    keywords: ["meus direitos", "duvida juridica", "lei", "consumidor", "clt", "direito"],
  },
];

// ---------- Helpers ----------

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id)!;
}

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function servicesByCategory(id: CategoryId): Service[] {
  return SERVICES.filter((s) => s.category === id);
}

export const LIVE_SERVICES = SERVICES.filter((s) => s.status === "live");

/** Remove acentos e coloca em minúsculas, para busca tolerante. */
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");
export function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(DIACRITICS, "").trim();
}

/** Busca local simples por nome/short/keywords (fallback sem IA). */
export function searchServices(query: string): Service[] {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(/\s+/);
  return SERVICES.map((s) => {
    const haystack = normalize(
      [s.name, s.short, s.description, ...s.keywords].join(" "),
    );
    const score = terms.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
    return { s, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.s);
}
