"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import {
  calcINSS,
  calcIRRFCompleto,
  IRRF_DEDUCAO_DEPENDENTE,
  TABELA_ANO,
  type IRRFResultado,
} from "@/lib/br";
import { formatBRL, formatPercent, parseNumber } from "@/lib/format";

export default function Irrf() {
  const [base, setBase] = useState("");
  const [inss, setInss] = useState("");
  const [dep, setDep] = useState("0");
  const [res, setRes] = useState<(IRRFResultado & { inss: number }) | null>(null);

  function calcular() {
    const b = parseNumber(base);
    if (!isFinite(b) || b <= 0) return;
    // Sem INSS informado, estima pelo INSS de empregado CLT.
    const inssInformado = parseNumber(inss);
    const inssValor = isFinite(inssInformado) ? inssInformado : calcINSS(b).valor;
    const r = calcIRRFCompleto({
      rendimento: b,
      inss: inssValor,
      dependentes: parseInt(dep || "0", 10) || 0,
    });
    setRes({ ...r, inss: inssValor });
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
            placeholder="Ex.: 6.000,00"
            value={base}
            onChange={(e) => setBase(e.target.value)}
          />
        </Field>
        <Field
          label="INSS descontado (opcional)"
          hint="Se deixar em branco, calculamos o INSS de CLT automaticamente."
        >
          <Input
            inputMode="decimal"
            placeholder="Ex.: 641,51"
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
            <Row
              label={res.simplificado ? "Base (desconto simplificado)" : "Base (INSS + dependentes)"}
              value={formatBRL(res.base)}
            />
            <Row label="INSS considerado" value={formatBRL(res.inss)} />
            <Row label="Alíquota da faixa" value={formatPercent(res.aliquota, 1)} />
            <Row label="Imposto pela tabela" value={formatBRL(res.impostoTabela)} />
            <Row label="Redução Lei 15.270/2025" value={`− ${formatBRL(res.reducao)}`} />
            <Row label="Imposto retido" value={formatBRL(res.valor)} strong />
            {res.valor === 0 && res.impostoTabela > 0 && (
              <p className="mt-3 rounded-lg bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                Isento em {TABELA_ANO}: quem recebe até R$ 5.000 por mês não paga IR
                retido na fonte.
              </p>
            )}
            <p className="mt-3 text-xs text-muted">
              Tabela progressiva de {TABELA_ANO} com a redução da Lei 15.270/2025
              (isenção até R$ 5.000 e redução parcial até R$ 7.350). Dedução por
              dependente: {formatBRL(IRRF_DEDUCAO_DEPENDENTE)}. Usa automaticamente o
              desconto mais vantajoso. Estimativa.
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
