"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row, Select } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, parseNumber } from "@/lib/format";

export default function SimuladorRendimento() {
  const [inicial, setInicial] = useState("");
  const [aporte, setAporte] = useState("");
  const [taxa, setTaxa] = useState("0,9");
  const [meses, setMeses] = useState("12");
  const [res, setRes] = useState<{
    total: number;
    investido: number;
    rendimento: number;
  } | null>(null);

  function calcular() {
    const i = parseNumber(inicial) || 0;
    const a = parseNumber(aporte) || 0;
    const r = (parseNumber(taxa) || 0) / 100;
    const n = parseInt(meses || "0", 10);
    if (n < 1 || (i <= 0 && a <= 0)) return;

    let saldo = i;
    for (let k = 0; k < n; k++) saldo = saldo * (1 + r) + a;
    const investido = round2(i + a * n);
    const total = round2(saldo);
    setRes({ total, investido, rendimento: round2(total - investido) });
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor inicial">
            <Input
              inputMode="decimal"
              placeholder="Ex.: 1.000,00"
              value={inicial}
              onChange={(e) => setInicial(e.target.value)}
            />
          </Field>
          <Field label="Aporte mensal">
            <Input
              inputMode="decimal"
              placeholder="Ex.: 200,00"
              value={aporte}
              onChange={(e) => setAporte(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rendimento (% ao mês)">
            <Input
              inputMode="decimal"
              value={taxa}
              onChange={(e) => setTaxa(e.target.value)}
            />
          </Field>
          <Field label="Aplicação de referência">
            <Select
              value={taxa}
              onChange={(e) => setTaxa(e.target.value)}
            >
              <option value="0,5">Poupança (~0,5%)</option>
              <option value="0,9">CDI (~0,9%)</option>
              <option value="1,0">1,0% a.m.</option>
            </Select>
          </Field>
        </div>
        <Field label="Período (meses)">
          <Input
            inputMode="numeric"
            value={meses}
            onChange={(e) => setMeses(e.target.value)}
          />
        </Field>
        <Button type="submit">Simular</Button>
      </form>

      <div>
        {res ? (
          <ResultBox tone="financas">
            <p className="mb-2 text-sm font-medium text-muted">
              Você teria ao final
            </p>
            <p className="mb-4 text-3xl font-extrabold text-foreground">
              {formatBRL(res.total)}
            </p>
            <Row label="Total investido" value={formatBRL(res.investido)} />
            <Row label="Rendimento (juros)" value={`+ ${formatBRL(res.rendimento)}`} />
            <Row label="Valor final" value={formatBRL(res.total)} strong />
            <p className="mt-3 text-xs text-muted">
              Juros compostos com aporte mensal. As taxas são aproximadas e variam
              com a Selic. Estimativa, sem descontar imposto de renda.
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Preencha os valores para simular o rendimento.
          </div>
        )}
      </div>
    </div>
  );
}
