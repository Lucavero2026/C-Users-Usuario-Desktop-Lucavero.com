"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import {
  calcIRRF,
  IRRF_DEDUCAO_DEPENDENTE,
  TABELA_ANO,
  round2,
} from "@/lib/br";
import { formatBRL, formatPercent, parseNumber } from "@/lib/format";

export default function Irrf() {
  const [base, setBase] = useState("");
  const [inss, setInss] = useState("");
  const [dep, setDep] = useState("0");
  const [res, setRes] = useState<{
    baseCalc: number;
    valor: number;
    aliquota: number;
  } | null>(null);

  function calcular() {
    const b = parseNumber(base);
    if (!isFinite(b) || b <= 0) return;
    const desconto =
      (parseNumber(inss) || 0) +
      (parseInt(dep || "0", 10) || 0) * IRRF_DEDUCAO_DEPENDENTE;
    const baseCalc = round2(Math.max(0, b - desconto));
    const r = calcIRRF(baseCalc);
    setRes({ baseCalc, valor: r.valor, aliquota: r.aliquota });
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
        <Field label="Rendimento tributável" hint="Salário ou pagamento bruto do mês.">
          <Input
            inputMode="decimal"
            placeholder="Ex.: 5.000,00"
            value={base}
            onChange={(e) => setBase(e.target.value)}
          />
        </Field>
        <Field label="INSS descontado (opcional)" hint="Dedutível da base do IR.">
          <Input
            inputMode="decimal"
            placeholder="Ex.: 550,00"
            value={inss}
            onChange={(e) => setInss(e.target.value)}
          />
        </Field>
        <Field label="Dependentes">
          <Input
            inputMode="numeric"
            value={dep}
            onChange={(e) => setDep(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Button type="submit">Calcular IRRF</Button>
      </form>

      <div>
        {res ? (
          <ResultBox tone="trabalhista">
            <p className="mb-2 text-sm font-medium text-muted">IRRF a reter</p>
            <p className="mb-4 text-3xl font-extrabold text-foreground">
              {formatBRL(res.valor)}
            </p>
            <Row label="Base de cálculo" value={formatBRL(res.baseCalc)} />
            <Row label="Alíquota" value={formatPercent(res.aliquota, 1)} />
            <Row label="Imposto retido" value={formatBRL(res.valor)} strong />
            <p className="mt-3 text-xs text-muted">
              Tabela progressiva de {TABELA_ANO}. Dedução por dependente:{" "}
              {formatBRL(IRRF_DEDUCAO_DEPENDENTE)}. Estimativa.
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Informe o rendimento para calcular o imposto retido.
          </div>
        )}
      </div>
    </div>
  );
}
