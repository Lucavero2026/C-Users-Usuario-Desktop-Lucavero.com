"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row, Select } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, parseNumber } from "@/lib/format";

export default function FeriasDecimo() {
  const [salario, setSalario] = useState("");
  const [meses, setMeses] = useState("12");
  const [dias, setDias] = useState("30");
  const [res, setRes] = useState<{
    decimo: number;
    feriasBase: number;
    terco: number;
    feriasTotal: number;
  } | null>(null);

  function calcular() {
    const s = parseNumber(salario);
    if (!isFinite(s) || s <= 0) return;
    const m = Math.min(12, Math.max(0, parseInt(meses, 10) || 0));
    const d = Math.min(30, Math.max(0, parseInt(dias, 10) || 0));
    const decimo = round2((s / 12) * m);
    const feriasBase = round2((s / 30) * d);
    const terco = round2(feriasBase / 3);
    setRes({
      decimo,
      feriasBase,
      terco,
      feriasTotal: round2(feriasBase + terco),
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
        <Field label="Salário bruto mensal">
          <Input
            inputMode="decimal"
            placeholder="Ex.: 3.000,00"
            value={salario}
            onChange={(e) => setSalario(e.target.value)}
          />
        </Field>
        <Field
          label="Meses trabalhados no ano"
          hint="Para o 13º proporcional (mês com 15+ dias conta)."
        >
          <Select value={meses} onChange={(e) => setMeses(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m} {m === 1 ? "mês" : "meses"}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Dias de férias" hint="Normalmente 30 dias.">
          <Input
            inputMode="numeric"
            value={dias}
            onChange={(e) => setDias(e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Button type="submit">Calcular</Button>
      </form>

      <div className="space-y-4">
        {res ? (
          <>
            <ResultBox tone="trabalhista">
              <p className="mb-1 text-sm font-medium text-muted">
                Férias + 1/3 (bruto)
              </p>
              <p className="mb-3 text-2xl font-extrabold">
                {formatBRL(res.feriasTotal)}
              </p>
              <Row label="Férias" value={formatBRL(res.feriasBase)} />
              <Row label="Terço constitucional" value={formatBRL(res.terco)} />
              <Row label="Total" value={formatBRL(res.feriasTotal)} strong />
            </ResultBox>
            <ResultBox tone="trabalhista">
              <p className="mb-1 text-sm font-medium text-muted">
                13º salário (bruto)
              </p>
              <p className="text-2xl font-extrabold">{formatBRL(res.decimo)}</p>
            </ResultBox>
            <p className="text-xs text-muted">
              Valores brutos e estimativos, antes de descontos de INSS e IRRF. Não
              consideram médias de horas extras, adicionais ou comissões.
            </p>
          </>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Informe seu salário para estimar férias e 13º.
          </div>
        )}
      </div>
    </div>
  );
}
