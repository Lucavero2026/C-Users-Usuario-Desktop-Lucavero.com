"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import { calcSalarioLiquido, TABELA_ANO, type SalarioResultado } from "@/lib/br";
import { formatBRL, formatPercent, parseNumber } from "@/lib/format";

export default function SalarioLiquido() {
  const [bruto, setBruto] = useState("");
  const [dependentes, setDependentes] = useState("0");
  const [outros, setOutros] = useState("");
  const [res, setRes] = useState<SalarioResultado | null>(null);

  function calcular() {
    const b = parseNumber(bruto);
    if (!isFinite(b) || b <= 0) return;
    setRes(
      calcSalarioLiquido({
        bruto: b,
        dependentes: parseInt(dependentes || "0", 10) || 0,
        outrosDescontos: parseNumber(outros) || 0,
      }),
    );
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
        <Field label="Salário bruto mensal" hint="Valor total antes dos descontos.">
          <Input
            inputMode="decimal"
            placeholder="Ex.: 4.500,00"
            value={bruto}
            onChange={(e) => setBruto(e.target.value)}
          />
        </Field>
        <Field label="Número de dependentes">
          <Input
            inputMode="numeric"
            value={dependentes}
            onChange={(e) => setDependentes(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Field
          label="Outros descontos (opcional)"
          hint="Vale-transporte, plano de saúde, adiantamentos, etc."
        >
          <Input
            inputMode="decimal"
            placeholder="Ex.: 200,00"
            value={outros}
            onChange={(e) => setOutros(e.target.value)}
          />
        </Field>
        <Button type="submit">Calcular salário líquido</Button>
      </form>

      <div>
        {res ? (
          <ResultBox tone="trabalhista">
            <p className="mb-2 text-sm font-medium text-muted">
              Salário líquido estimado
            </p>
            <p className="mb-4 text-3xl font-extrabold text-foreground">
              {formatBRL(res.liquido)}
            </p>
            <Row label="Salário bruto" value={formatBRL(res.bruto)} />
            <Row label="INSS" value={`− ${formatBRL(res.inss)}`} />
            <Row
              label={`IRRF (${formatPercent(res.aliquotaIRRF, 1)})`}
              value={`− ${formatBRL(res.irrf)}`}
            />
            {res.outrosDescontos > 0 && (
              <Row
                label="Outros descontos"
                value={`− ${formatBRL(res.outrosDescontos)}`}
              />
            )}
            <Row label="Líquido" value={formatBRL(res.liquido)} strong />
            <p className="mt-3 text-xs text-muted">
              Tabelas de INSS e IRRF de {TABELA_ANO}. O IRRF usa automaticamente o
              desconto (simplificado ou por dependentes) mais vantajoso. Estimativa.
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Preencha o salário bruto e clique em calcular para ver o resultado.
          </div>
        )}
      </div>
    </div>
  );
}
