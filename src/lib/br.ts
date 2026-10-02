/**
 * Regras e tabelas brasileiras (INSS, IRRF, documentos, Pix).
 * As tabelas de imposto são de 2026 — atualize os valores abaixo quando
 * o governo publicar as tabelas do ano vigente.
 */

// ----------------------------------------------------------------------------
// Tabelas 2026 (fáceis de atualizar)
// ----------------------------------------------------------------------------

export const TABELA_ANO = 2026;

/** Salário mínimo nacional vigente (base do DAS-MEI e da 1ª faixa do INSS). */
export const SALARIO_MINIMO = 1621.0;

/** INSS — alíquotas progressivas por faixa (2026). */
export const INSS_FAIXAS = [
  { ate: 1621.0, aliquota: 0.075 },
  { ate: 2902.84, aliquota: 0.09 },
  { ate: 4354.27, aliquota: 0.12 },
  { ate: 8475.55, aliquota: 0.14 },
];
export const INSS_TETO = 8475.55;

/** IRRF — tabela mensal progressiva (vigente desde maio/2025, mantida em 2026). */
export const IRRF_FAIXAS = [
  { ate: 2428.8, aliquota: 0, deducao: 0 },
  { ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
  { ate: 3751.05, aliquota: 0.15, deducao: 394.16 },
  { ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
  { ate: Infinity, aliquota: 0.275, deducao: 908.73 },
];
export const IRRF_DEDUCAO_DEPENDENTE = 189.59;
/** Desconto simplificado mensal (substitui INSS e demais deduções). */
export const IRRF_DESCONTO_SIMPLIFICADO = 607.2;

/**
 * Redução do IRRF da Lei 15.270/2025 (a partir de jan/2026), calculada sobre o
 * rendimento tributável BRUTO do mês:
 * - até R$ 5.000,00: redução de até R$ 312,89 (zera o imposto);
 * - de R$ 5.000,01 a R$ 7.350,00: redução = 978,62 − 0,133145 × rendimento;
 * - acima de R$ 7.350,00: sem redução.
 */
export const IRRF_REDUCAO = {
  limiteIsencao: 5000,
  reducaoMaxima: 312.89,
  limiteParcial: 7350,
  constante: 978.62,
  fator: 0.133145,
};

// ----------------------------------------------------------------------------
// Cálculos
// ----------------------------------------------------------------------------

/** INSS progressivo sobre o salário de contribuição. */
export function calcINSS(salario: number): { valor: number; aliquotaEfetiva: number } {
  const base = Math.min(salario, INSS_TETO);
  let anterior = 0;
  let total = 0;
  for (const faixa of INSS_FAIXAS) {
    if (base > anterior) {
      const trecho = Math.min(base, faixa.ate) - anterior;
      total += trecho * faixa.aliquota;
      anterior = faixa.ate;
    } else break;
  }
  return {
    valor: round2(total),
    aliquotaEfetiva: salario > 0 ? (total / salario) * 100 : 0,
  };
}

/** IRRF pela tabela progressiva, sobre uma base já líquida de deduções. */
export function calcIRRF(base: number): {
  valor: number;
  aliquota: number;
  faixa: number;
} {
  if (base <= 0) return { valor: 0, aliquota: 0, faixa: 0 };
  for (let i = 0; i < IRRF_FAIXAS.length; i++) {
    const f = IRRF_FAIXAS[i];
    if (base <= f.ate) {
      const valor = Math.max(0, base * f.aliquota - f.deducao);
      return { valor: round2(valor), aliquota: f.aliquota * 100, faixa: i };
    }
  }
  return { valor: 0, aliquota: 0, faixa: 0 };
}

/** Redução da Lei 15.270/2025, limitada ao imposto calculado pela tabela. */
export function calcReducaoIRRF(rendimentoBruto: number, impostoTabela: number): number {
  const r = IRRF_REDUCAO;
  let reducao = 0;
  if (rendimentoBruto <= r.limiteIsencao) reducao = r.reducaoMaxima;
  else if (rendimentoBruto <= r.limiteParcial)
    reducao = r.constante - r.fator * rendimentoBruto;
  return round2(Math.max(0, Math.min(impostoTabela, reducao)));
}

export interface IRRFResultado {
  /** base de cálculo usada (após deduções ou desconto simplificado) */
  base: number;
  /** imposto pela tabela progressiva, antes da redução */
  impostoTabela: number;
  /** redução da Lei 15.270/2025 */
  reducao: number;
  /** imposto final a reter */
  valor: number;
  aliquota: number;
  simplificado: boolean;
}

/**
 * IRRF de 2026: compara deduções legais × desconto simplificado (fica com o
 * menor imposto), aplica a tabela e depois a redução sobre o rendimento bruto.
 */
export function calcIRRFCompleto(params: {
  rendimento: number;
  inss?: number;
  dependentes?: number;
  permitirSimplificado?: boolean;
}): IRRFResultado {
  const { rendimento, inss = 0, dependentes = 0, permitirSimplificado = true } = params;
  const baseCompleta = Math.max(0, rendimento - inss - dependentes * IRRF_DEDUCAO_DEPENDENTE);
  const baseSimplificada = Math.max(0, rendimento - IRRF_DESCONTO_SIMPLIFICADO);

  const tCompleta = calcIRRF(baseCompleta);
  const tSimpl = calcIRRF(baseSimplificada);
  const simplificado = permitirSimplificado && tSimpl.valor < tCompleta.valor;
  const tabela = simplificado ? tSimpl : tCompleta;

  const reducao = calcReducaoIRRF(rendimento, tabela.valor);
  return {
    base: round2(simplificado ? baseSimplificada : baseCompleta),
    impostoTabela: tabela.valor,
    reducao,
    valor: round2(tabela.valor - reducao),
    aliquota: tabela.aliquota,
    simplificado,
  };
}

export interface SalarioResultado {
  bruto: number;
  inss: number;
  irrf: number;
  irrfTabela: number;
  reducaoIRRF: number;
  baseIRRF: number;
  outrosDescontos: number;
  liquido: number;
  aliquotaIRRF: number;
  simplificado: boolean;
}

/** Salário líquido: bruto − INSS − IRRF − outros descontos. */
export function calcSalarioLiquido(params: {
  bruto: number;
  dependentes?: number;
  outrosDescontos?: number;
  usarSimplificado?: boolean;
}): SalarioResultado {
  const { bruto, dependentes = 0, outrosDescontos = 0, usarSimplificado = true } =
    params;
  const inss = calcINSS(bruto).valor;
  const ir = calcIRRFCompleto({
    rendimento: bruto,
    inss,
    dependentes,
    permitirSimplificado: usarSimplificado,
  });
  const liquido = bruto - inss - ir.valor - outrosDescontos;

  return {
    bruto: round2(bruto),
    inss,
    irrf: ir.valor,
    irrfTabela: ir.impostoTabela,
    reducaoIRRF: ir.reducao,
    baseIRRF: ir.base,
    outrosDescontos: round2(outrosDescontos),
    liquido: round2(liquido),
    aliquotaIRRF: ir.aliquota,
    simplificado: ir.simplificado,
  };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// ----------------------------------------------------------------------------
// Rescisão / acerto trabalhista (estimativa)
// ----------------------------------------------------------------------------

export type TipoRescisao =
  | "sem-justa-causa"
  | "pedido"
  | "acordo"
  | "justa-causa";

export interface RescisaoResultado {
  saldoSalario: number;
  decimo: number;
  feriasProp: number;
  tercoFerias: number;
  feriasVencidas: number;
  aviso: number;
  multaFgts: number;
  total: number;
  mesesTrabalhados: number;
}

/** Estimativa de verbas rescisórias. Não considera INSS/IRRF nem médias. */
export function calcRescisao(p: {
  salario: number;
  admissao: string; // YYYY-MM-DD
  demissao: string;
  tipo: TipoRescisao;
  avisoTrabalhado: boolean;
  feriasVencidas: boolean;
  saldoFgts: number;
}): RescisaoResultado {
  const d1 = new Date(p.admissao + "T00:00:00");
  const d2 = new Date(p.demissao + "T00:00:00");
  const salario = p.salario;

  let meses =
    (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  if (d2.getDate() < d1.getDate()) meses -= 1;
  meses = Math.max(0, meses);
  const anos = Math.floor(meses / 12);

  const saldoSalario = round2((salario / 30) * d2.getDate());

  const semDireitoProp = p.tipo === "justa-causa";
  const mesesAno = d2.getMonth() + (d2.getDate() >= 15 ? 1 : 0);
  const decimo = semDireitoProp ? 0 : round2((salario / 12) * mesesAno);

  const mesesPeriodo = Math.min(12, (meses % 12) + (d2.getDate() >= 15 ? 1 : 0));
  const feriasProp = semDireitoProp ? 0 : round2((salario / 12) * mesesPeriodo);
  const tercoFerias = round2(feriasProp / 3);

  const feriasVenc = p.feriasVencidas ? round2(salario + salario / 3) : 0;

  const diasAviso = Math.min(90, 30 + 3 * anos);
  let aviso = 0;
  if (!p.avisoTrabalhado) {
    if (p.tipo === "sem-justa-causa") aviso = round2((salario / 30) * diasAviso);
    else if (p.tipo === "acordo")
      aviso = round2(((salario / 30) * diasAviso) / 2);
  }

  const pct = p.tipo === "sem-justa-causa" ? 0.4 : p.tipo === "acordo" ? 0.2 : 0;
  const multaFgts = round2((p.saldoFgts || 0) * pct);

  const total = round2(
    saldoSalario +
      decimo +
      feriasProp +
      tercoFerias +
      feriasVenc +
      aviso +
      multaFgts,
  );

  return {
    saldoSalario,
    decimo,
    feriasProp,
    tercoFerias,
    feriasVencidas: feriasVenc,
    aviso,
    multaFgts,
    total,
    mesesTrabalhados: meses,
  };
}

// ----------------------------------------------------------------------------
// Documentos: CPF, CNPJ, PIS
// ----------------------------------------------------------------------------

function dv(numbers: number[], pesoInicial: number): number {
  let peso = pesoInicial;
  const soma = numbers.reduce((acc, n) => acc + n * peso--, 0);
  const resto = (soma * 10) % 11;
  return resto === 10 || resto === 11 ? 0 : resto;
}

export function isValidCPF(input: string): boolean {
  const cpf = (input || "").replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const nums = cpf.split("").map(Number);
  const d1 = dv(nums.slice(0, 9), 10);
  const d2 = dv(nums.slice(0, 10), 11);
  return d1 === nums[9] && d2 === nums[10];
}

export function generateCPF(): string {
  const nums = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const d1 = dv(nums, 10);
  const d2 = dv([...nums, d1], 11);
  return [...nums, d1, d2].join("");
}

export function formatCPF(cpf: string): string {
  const d = cpf.replace(/\D/g, "").padStart(11, "0").slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

const CNPJ_PESO1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_PESO2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function cnpjDV(nums: number[], pesos: number[]): number {
  const soma = nums.reduce((acc, n, i) => acc + n * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function isValidCNPJ(input: string): boolean {
  const cnpj = (input || "").replace(/\D/g, "");
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const nums = cnpj.split("").map(Number);
  const d1 = cnpjDV(nums.slice(0, 12), CNPJ_PESO1);
  const d2 = cnpjDV(nums.slice(0, 13), CNPJ_PESO2);
  return d1 === nums[12] && d2 === nums[13];
}

export function generateCNPJ(): string {
  const nums = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
  const filial = [0, 0, 0, 1]; // matriz 0001
  const base = [...nums, ...filial];
  const d1 = cnpjDV(base, CNPJ_PESO1);
  const d2 = cnpjDV([...base, d1], CNPJ_PESO2);
  return [...base, d1, d2].join("");
}

export function formatCNPJ(cnpj: string): string {
  const d = cnpj.replace(/\D/g, "").padStart(14, "0").slice(0, 14);
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

const PIS_PESOS = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export function isValidPIS(input: string): boolean {
  const pis = (input || "").replace(/\D/g, "");
  if (pis.length !== 11 || /^(\d)\1{10}$/.test(pis)) return false;
  const nums = pis.split("").map(Number);
  const soma = PIS_PESOS.reduce((acc, p, i) => acc + p * nums[i], 0);
  const resto = soma % 11;
  const d = resto < 2 ? 0 : 11 - resto;
  return d === nums[10];
}

export function generatePIS(): string {
  const nums = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10));
  const soma = PIS_PESOS.reduce((acc, p, i) => acc + p * nums[i], 0);
  const resto = soma % 11;
  const d = resto < 2 ? 0 : 11 - resto;
  return [...nums, d].join("");
}

export function formatPIS(pis: string): string {
  const d = pis.replace(/\D/g, "").padStart(11, "0").slice(0, 11);
  return d.replace(/(\d{3})(\d{5})(\d{2})(\d{1})/, "$1.$2.$3-$4");
}

// ----------------------------------------------------------------------------
// Pix — BR Code (EMV) "Copia e Cola"
// ----------------------------------------------------------------------------

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");
function sanitizeText(text: string, max: number): string {
  return (text || "")
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .slice(0, max)
    .trim();
}

export interface PixParams {
  chave: string;
  nome: string;
  cidade: string;
  valor?: number;
  descricao?: string;
  txid?: string;
}

/** Gera o payload Pix "Copia e Cola" (BR Code estático). */
export function generatePixPayload(p: PixParams): string {
  const nome = sanitizeText(p.nome, 25) || "RECEBEDOR";
  const cidade = sanitizeText(p.cidade, 15) || "CIDADE";
  const txid = sanitizeText(p.txid || "***", 25) || "***";
  const chave = (p.chave || "").trim();

  const descricao = p.descricao ? sanitizeText(p.descricao, 50) : "";
  const gui = emv("00", "br.gov.bcb.pix");
  const chaveField = emv("01", chave);
  const descField = descricao ? emv("02", descricao) : "";
  const merchantAccount = emv("26", gui + chaveField + descField);

  let payload =
    emv("00", "01") + // payload format
    merchantAccount +
    emv("52", "0000") + // categoria
    emv("53", "986") + // BRL
    (p.valor && p.valor > 0
      ? emv("54", p.valor.toFixed(2))
      : "") +
    emv("58", "BR") +
    emv("59", nome) +
    emv("60", cidade) +
    emv("62", emv("05", txid));

  payload += "6304";
  return payload + crc16(payload);
}
