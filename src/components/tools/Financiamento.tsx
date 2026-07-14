"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, parseNumber } from "@/lib/format";

export default function Financiamento() {
  const [valor, setValor] = useState("");
  const [taxa, setTaxa] = useState("1,5");
  const [parcelas, setParcelas] = useState("48");
  const [res, setRes] = useState<{
    price: { parcela: number; total: number; juros: number };
    sac: { primeira: number; ultima: number; total: number; juros: number };
  } | null>(null);

  function calcular() {
    const pv = parseNumber(valor);
    const i = (parseNumber(taxa) || 0) / 100;
    const n = parseInt(parcelas || "0", 10);
    if (!isFinite(pv) || pv <= 0 || n < 1) return;

    // Price (parcela fixa)
    const pmt = i > 0 ? (pv * i) / (1 - Math.pow(1 + i, -n)) : pv / n;
    const totalPrice = pmt * n;

    // SAC (amortização constante)
    const amort = pv / n;
    const primeira = amort + pv * i;
    const ultima = amort + amort * i;
    const jurosSac = i * pv * ((n + 1) / 2);
    const totalSac = pv + jurosSac;

    setRes({
      price: {
        parcela: round2(pmt),
        total: round2(totalPrice),
        juros: round2(totalPrice - pv),
      },
      sac: {
        primeira: round2(primeira),
        ultima: round2(ultima),
        total: round2(totalSac),
        juros: round2(jurosSac),
      },
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          calcular();
        }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <Field label="Valor financiado">
          <Input
            inputMode="decimal"
            placeholder="Ex.: 50.000,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </Field>
        <Field label="Juros (% ao mês)">
          <Input
            inputMode="decimal"
            value={taxa}
            onChange={(e) => setTaxa(e.target.value)}
          />
        </Field>
        <Field label="Nº de parcelas">
          <Input
            inputMode="numeric"
            value={parcelas}
            onChange={(e) => setParcelas(e.target.value)}
          />
        </Field>
        <div className="sm:col-span-3">
          <Button type="submit">Simular financiamento</Button>
        </div>
      </form>

      {res ? (
        <div className="grid gap-4 md:grid-cols-2">
          <ResultBox tone="financas">
            <p className="mb-1 text-sm font-medium text-muted">Sistema Price</p>
            <p className="mb-3 text-xs text-muted">Parcela fixa do início ao fim.</p>
            <p className="mb-3 text-2xl font-extrabold">
              {formatBRL(res.price.parcela)}
              <span className="text-sm font-normal text-muted"> /mês</span>
            </p>
            <Row label="Total pago" value={formatBRL(res.price.total)} />
            <Row label="Total de juros" value={formatBRL(res.price.juros)} strong />
          </ResultBox>

          <ResultBox tone="financas">
            <p className="mb-1 text-sm font-medium text-muted">Sistema SAC</p>
            <p className="mb-3 text-xs text-muted">
              Parcela começa maior e vai diminuindo.
            </p>
            <Row label="1ª parcela" value={formatBRL(res.sac.primeira)} />
            <Row label="Última parcela" value={formatBRL(res.sac.ultima)} />
            <Row label="Total pago" value={formatBRL(res.sac.total)} />
            <Row label="Total de juros" value={formatBRL(res.sac.juros)} strong />
          </ResultBox>
        </div>
      ) : (
        <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
          Preencha os dados para comparar os dois sistemas de amortização.
        </div>
      )}
      <p className="text-xs text-muted">
        No <strong>Price</strong> a parcela é fixa; no <strong>SAC</strong> ela começa
        mais alta e diminui, e o total de juros costuma ser menor. Estimativa — o
        banco pode incluir seguros e taxas (CET).
      </p>
    </div>
  );
}
