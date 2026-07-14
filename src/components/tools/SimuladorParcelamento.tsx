"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, formatPercent, parseNumber } from "@/lib/format";

export default function SimuladorParcelamento() {
  const [aVista, setAVista] = useState("");
  const [aPrazo, setAPrazo] = useState("");
  const [parcelas, setParcelas] = useState("");
  const [rendimento, setRendimento] = useState("0,8");
  const [res, setRes] = useState<{
    parcela: number;
    juros: number;
    jurosPct: number;
    saldoFinal: number;
    compensaParcelar: boolean;
  } | null>(null);

  function calcular() {
    const v = parseNumber(aVista);
    const p = parseNumber(aPrazo);
    const n = parseInt(parcelas || "0", 10);
    if (!isFinite(v) || v <= 0 || !isFinite(p) || p <= 0 || n < 1) return;
    const r = (parseNumber(rendimento) || 0) / 100;

    const parcela = round2(p / n);
    const juros = round2(p - v);
    const jurosPct = v > 0 ? (juros / v) * 100 : 0;

    // Mantém o valor à vista aplicado e vai pagando as parcelas.
    let saldo = v;
    for (let k = 0; k < n; k++) saldo = saldo * (1 + r) - parcela;
    const saldoFinal = round2(saldo);

    setRes({
      parcela,
      juros,
      jurosPct,
      saldoFinal,
      compensaParcelar: saldoFinal > 0,
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          calcular();
        }}
        className="space-y-4"
      >
        <Field label="Preço à vista (com desconto)">
          <Input
            inputMode="decimal"
            placeholder="Ex.: 900,00"
            value={aVista}
            onChange={(e) => setAVista(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Preço total parcelado">
            <Input
              inputMode="decimal"
              placeholder="Ex.: 1.000,00"
              value={aPrazo}
              onChange={(e) => setAPrazo(e.target.value)}
            />
          </Field>
          <Field label="Nº de parcelas">
            <Input
              inputMode="numeric"
              placeholder="Ex.: 10"
              value={parcelas}
              onChange={(e) => setParcelas(e.target.value)}
            />
          </Field>
        </div>
        <Field
          label="Rendimento do seu dinheiro (% ao mês)"
          hint="Quanto renderia se ficasse aplicado. CDI ≈ 0,8–1%/mês."
        >
          <Input
            inputMode="decimal"
            value={rendimento}
            onChange={(e) => setRendimento(e.target.value)}
          />
        </Field>
        <Button type="submit">Comparar</Button>
      </form>

      <div>
        {res ? (
          <ResultBox tone="financas">
            <p className="mb-2 text-sm font-medium text-muted">Veredito</p>
            <p className="mb-4 text-2xl font-extrabold text-foreground">
              {res.compensaParcelar
                ? "Compensa parcelar 💳"
                : "Compensa pagar à vista 💰"}
            </p>
            <Row label="Valor de cada parcela" value={formatBRL(res.parcela)} />
            <Row
              label="Juros embutidos no prazo"
              value={`${formatBRL(res.juros)} (${formatPercent(res.jurosPct, 1)})`}
            />
            <Row
              label={
                res.compensaParcelar
                  ? "Sobra aplicando e parcelando"
                  : "Custo extra de parcelar"
              }
              value={formatBRL(Math.abs(res.saldoFinal))}
              strong
            />
            <p className="mt-3 text-xs text-muted">
              Simulação: mantendo o valor à vista aplicado e pagando as parcelas.
              Se ao final sobra dinheiro, parcelar valeu a pena; senão, o desconto
              à vista ganha. Estimativa.
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Informe os dois preços e o rendimento para comparar.
          </div>
        )}
      </div>
    </div>
  );
}
