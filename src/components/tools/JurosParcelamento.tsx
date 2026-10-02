"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, formatPercent, parseNumber } from "@/lib/format";

/**
 * Descobre a taxa mensal implícita de uma série de parcelas iguais (Price):
 * valor financiado = parcela × (1 − (1+i)^−n) / i. Resolve por bisseção.
 */
function taxaImplicita(financiado: number, parcela: number, n: number): number | null {
  if (parcela * n <= financiado) return 0;
  const pv = (i: number) => (i === 0 ? parcela * n : (parcela * (1 - Math.pow(1 + i, -n))) / i);
  let lo = 0;
  let hi = 1; // 100% ao mês
  if (pv(hi) > financiado) return null;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > financiado) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

interface Resultado {
  taxaMes: number;
  taxaAno: number;
  total: number;
  juros: number;
  financiado: number;
}

export default function JurosParcelamento() {
  const [vista, setVista] = useState("");
  const [entrada, setEntrada] = useState("");
  const [n, setN] = useState("");
  const [parcela, setParcela] = useState("");
  const [primeiraNoAto, setPrimeiraNoAto] = useState(false);
  const [erro, setErro] = useState("");
  const [res, setRes] = useState<Resultado | null>(null);

  function calcular() {
    setErro("");
    const pv = parseNumber(vista);
    const e = parseNumber(entrada) || 0;
    const qtd = parseInt(n || "0", 10) || 0;
    const p = parseNumber(parcela);
    if (!isFinite(pv) || pv <= 0 || qtd <= 0 || !isFinite(p) || p <= 0) return;
    // Primeira parcela no ato funciona como uma entrada.
    const financiado = pv - e - (primeiraNoAto ? p : 0);
    const nRestante = primeiraNoAto ? qtd - 1 : qtd;
    if (financiado <= 0 || nRestante <= 0) {
      setErro("Com esses valores não sobra saldo financiado — confira os campos.");
      setRes(null);
      return;
    }
    const i = taxaImplicita(financiado, p, nRestante);
    if (i === null) {
      setErro("A taxa passa de 100% ao mês — confira os valores digitados.");
      setRes(null);
      return;
    }
    const total = e + p * qtd;
    setRes({
      taxaMes: i * 100,
      taxaAno: (Math.pow(1 + i, 12) - 1) * 100,
      total: round2(total),
      juros: round2(total - pv),
      financiado: round2(financiado),
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          calcular();
        }}
        className="space-y-4"
      >
        <Field label="Preço à vista" hint="Quanto custaria pagando tudo agora.">
          <Input inputMode="decimal" placeholder="Ex.: 2.500,00" value={vista} onChange={(e) => setVista(e.target.value)} />
        </Field>
        <Field label="Entrada (opcional)">
          <Input inputMode="decimal" placeholder="0,00" value={entrada} onChange={(e) => setEntrada(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Número de parcelas">
            <Input inputMode="numeric" placeholder="Ex.: 12" value={n} onChange={(e) => setN(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Valor de cada parcela">
            <Input inputMode="decimal" placeholder="Ex.: 249,90" value={parcela} onChange={(e) => setParcela(e.target.value)} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={primeiraNoAto} onChange={(e) => setPrimeiraNoAto(e.target.checked)} />
          A primeira parcela é paga no ato da compra (1 + N)
        </label>
        <Button type="submit">Descobrir os juros</Button>
        {erro && <p className="text-sm text-rose-600">{erro}</p>}
      </form>

      <div>
        {res ? (
          <ResultBox tone="financas">
            <p className="mb-2 text-sm font-medium text-muted">Juros embutidos no parcelamento</p>
            <p className="mb-1 text-3xl font-extrabold text-foreground">{formatPercent(res.taxaMes)} ao mês</p>
            <p className="mb-4 text-sm text-muted">equivale a {formatPercent(res.taxaAno)} ao ano</p>
            <Row label="Preço à vista" value={formatBRL(res.total - res.juros)} />
            <Row label="Total pago parcelando" value={formatBRL(res.total)} />
            <Row label="Você paga a mais" value={formatBRL(res.juros)} strong />
            <p className="mt-3 text-sm text-foreground/80">
              {res.taxaMes < 0.01
                ? "Sem juros: o parcelamento sai pelo mesmo preço do à vista. Se o dinheiro estiver aplicado rendendo, parcelar pode até compensar."
                : res.taxaMes < 1
                  ? "Juros baixos. Compare com o rendimento do seu dinheiro aplicado: se render mais que isso, parcelar pode valer a pena."
                  : res.taxaMes < 3
                    ? "Juros relevantes. Se você tem o dinheiro, pagar à vista (ou pedir desconto) costuma ser melhor."
                    : "Juros muito altos! Evite esse parcelamento se puder — negocie o preço à vista ou procure crédito mais barato."}
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Informe o preço à vista e as parcelas para descobrir a taxa de juros real da oferta.
          </div>
        )}
      </div>
    </div>
  );
}
