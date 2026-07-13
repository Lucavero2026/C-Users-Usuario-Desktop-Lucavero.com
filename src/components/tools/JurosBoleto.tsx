"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, parseNumber } from "@/lib/format";

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function JurosBoleto() {
  const [valor, setValor] = useState("");
  const [venc, setVenc] = useState("");
  const [pag, setPag] = useState(hoje());
  const [multa, setMulta] = useState("2");
  const [juros, setJuros] = useState("1");
  const [res, setRes] = useState<{
    dias: number;
    multa: number;
    juros: number;
    total: number;
    original: number;
  } | null>(null);

  function calcular() {
    const v = parseNumber(valor);
    if (!isFinite(v) || v <= 0 || !venc || !pag) return;
    const dvenc = new Date(venc + "T00:00:00");
    const dpag = new Date(pag + "T00:00:00");
    const dias = Math.max(
      0,
      Math.round((dpag.getTime() - dvenc.getTime()) / 86400000),
    );
    if (dias === 0) {
      setRes({ dias: 0, multa: 0, juros: 0, total: round2(v), original: round2(v) });
      return;
    }
    const mMulta = round2(v * ((parseNumber(multa) || 0) / 100));
    const jMes = (parseNumber(juros) || 0) / 100;
    const mJuros = round2(v * (jMes / 30) * dias);
    setRes({
      dias,
      multa: mMulta,
      juros: mJuros,
      total: round2(v + mMulta + mJuros),
      original: round2(v),
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
        <Field label="Valor original do boleto">
          <Input
            inputMode="decimal"
            placeholder="Ex.: 350,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vencimento">
            <Input type="date" value={venc} onChange={(e) => setVenc(e.target.value)} />
          </Field>
          <Field label="Pagamento">
            <Input type="date" value={pag} onChange={(e) => setPag(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Multa (%)" hint="Máx. 2% (CDC).">
            <Input
              inputMode="decimal"
              value={multa}
              onChange={(e) => setMulta(e.target.value)}
            />
          </Field>
          <Field label="Juros ao mês (%)" hint="Mora, geralmente 1%.">
            <Input
              inputMode="decimal"
              value={juros}
              onChange={(e) => setJuros(e.target.value)}
            />
          </Field>
        </div>
        <Button type="submit">Calcular</Button>
      </form>

      <div>
        {res ? (
          <ResultBox tone="financas">
            <p className="mb-2 text-sm font-medium text-muted">Total a pagar</p>
            <p className="mb-4 text-3xl font-extrabold text-foreground">
              {formatBRL(res.total)}
            </p>
            <Row label="Valor original" value={formatBRL(res.original)} />
            <Row label={`Atraso`} value={`${res.dias} dia(s)`} />
            <Row label="Multa" value={`+ ${formatBRL(res.multa)}`} />
            <Row label="Juros de mora" value={`+ ${formatBRL(res.juros)}`} />
            <Row label="Total" value={formatBRL(res.total)} strong />
            <p className="mt-3 text-xs text-muted">
              Cálculo simples de multa fixa + juros pro rata die. O credor pode ter
              regras próprias. Estimativa.
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Informe o valor e as datas para calcular multa e juros.
          </div>
        )}
      </div>
    </div>
  );
}
