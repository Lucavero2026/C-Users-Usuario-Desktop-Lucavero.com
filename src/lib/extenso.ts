/** Converte um valor em reais para texto por extenso (pt-BR). */

const UNIDADES = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
  "dez",
  "onze",
  "doze",
  "treze",
  "quatorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];
const DEZENAS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];
const CENTENAS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function tresDigitos(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (c > 0) partes.push(CENTENAS[c]);
  if (resto > 0) {
    if (resto < 20) partes.push(UNIDADES[resto]);
    else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      partes.push(u > 0 ? `${DEZENAS[d]} e ${UNIDADES[u]}` : DEZENAS[d]);
    }
  }
  return partes.join(" e ");
}

function inteiroPorExtenso(n: number): string {
  if (n === 0) return "zero";
  const grupos: number[] = [];
  let resto = n;
  while (resto > 0) {
    grupos.push(resto % 1000);
    resto = Math.floor(resto / 1000);
  }
  const escalas = [
    ["", ""],
    ["mil", "mil"],
    ["milhão", "milhões"],
    ["bilhão", "bilhões"],
  ];
  const partes: string[] = [];
  for (let i = grupos.length - 1; i >= 0; i--) {
    const g = grupos[i];
    if (g === 0) continue;
    let texto = tresDigitos(g);
    if (i === 1) {
      texto = g === 1 ? "mil" : `${texto} mil`;
    } else if (i >= 2) {
      texto = `${texto} ${g === 1 ? escalas[i][0] : escalas[i][1]}`;
    }
    partes.push(texto);
  }
  return partes.join(" e ").replace(/\s+/g, " ").trim();
}

export function valorPorExtenso(valor: number): string {
  const inteiro = Math.floor(valor);
  const centavos = Math.round((valor - inteiro) * 100);
  const reais = `${inteiroPorExtenso(inteiro)} ${inteiro === 1 ? "real" : "reais"}`;
  if (centavos === 0) return capitalize(reais);
  const centTxt = `${inteiroPorExtenso(centavos)} ${
    centavos === 1 ? "centavo" : "centavos"
  }`;
  return capitalize(`${reais} e ${centTxt}`);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
