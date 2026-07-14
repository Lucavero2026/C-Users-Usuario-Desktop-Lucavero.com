"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row, Select } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, parseNumber } from "@/lib/format";

// Valores do DAS-MEI 2025 (INSS 5% do salário mínimo de R$ 1.518 = R$ 75,90).
const ANO = 2025;
const VALORES: Record<string, { label: string; valor: number }> = {
  comercio: { label: "Comércio ou Indústria (INSS + ICMS)", valor: 76.9 },
  servicos: { label: "Serviços (INSS + ISS)", valor: 80.9 },
  ambos: { label: "Comércio e Serviços (INSS + ICMS + ISS)", valor: 81.9 },
};

export default function DasMei() {
  const [atividade, setAtividade] = useState("comercio");
  const [dias, setDias] = useState("");
  const [res, setRes] = useState<{
    valor: number;
    multa: number;
    juros: number;
    total: number;
    dias: number;
  } | null>(null);

  const mensal = VALORES[atividade].valor;

  function calcularAtraso() {
    const d = parseInt(dias || "0", 10) || 0;
    // Multa de mora: 0,33% por dia, limitada a 20%. Juros: ~1% ao mês (estimativa).
    const multaPct = Math.min(20, d * 0.33) / 100;
    const multa = round2(mensal * multaPct);
    const meses = Math.ceil(d / 30);
    const juros = round2(mensal * 0.01 * meses);
    setRes({
      valor: mensal,
      multa,
      juros,
      total: round2(mensal + multa + juros),
      dias: d,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <Field label="Sua atividade">
          <Select value={atividade} onChange={(e) => setAtividade(e.target.value)}>
            {Object.entries(VALORES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>

        <ResultBox tone="financas">
          <p className="text-sm font-medium text-muted">Valor mensal do DAS ({ANO})</p>
          <p className="my-1 text-3xl font-extrabold">{formatBRL(mensal)}</p>
          <Row label="Em 12 meses" value={formatBRL(round2(mensal * 12))} />
        </ResultBox>

        <div className="rounded-2xl border border-border bg-surface-muted p-4 text-sm text-muted">
          <p className="font-medium text-foreground">Como pagar</p>
          <p className="mt-1">
            A guia oficial é emitida no portal do MEI. Acesse{" "}
            <a
              href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand underline"
            >
              gov.br → Empreendedor
            </a>{" "}
            e use o PGMEI para gerar o DAS.
          </p>
        </div>
      </div>

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            calcularAtraso();
          }}
          className="space-y-4"
        >
          <Field label="Está atrasado? Dias de atraso" hint="Para estimar multa e juros.">
            <Input
              inputMode="numeric"
              placeholder="Ex.: 45"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
            />
          </Field>
          <Button type="submit" variant="outline">
            Calcular DAS em atraso
          </Button>
        </form>

        {res && (
          <div className="mt-4">
            <ResultBox tone="financas">
              <p className="mb-2 text-sm font-medium text-muted">
                DAS com {res.dias} dia(s) de atraso
              </p>
              <p className="mb-3 text-2xl font-extrabold">{formatBRL(res.total)}</p>
              <Row label="Valor original" value={formatBRL(res.valor)} />
              <Row label="Multa de mora" value={`+ ${formatBRL(res.multa)}`} />
              <Row label="Juros (estimativa)" value={`+ ${formatBRL(res.juros)}`} />
              <Row label="Total" value={formatBRL(res.total)} strong />
              <p className="mt-3 text-xs text-muted">
                Estimativa. Multa de 0,33% ao dia (máx. 20%) + juros aproximados. O
                valor oficial atualizado sai no PGMEI.
              </p>
            </ResultBox>
          </div>
        )}
      </div>
    </div>
  );
}
