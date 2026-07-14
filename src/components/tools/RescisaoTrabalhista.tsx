"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row, Select } from "@/components/ui";
import { calcRescisao, type RescisaoResultado, type TipoRescisao } from "@/lib/br";
import { formatBRL, parseNumber } from "@/lib/format";

export default function RescisaoTrabalhista() {
  const [salario, setSalario] = useState("");
  const [admissao, setAdmissao] = useState("");
  const [demissao, setDemissao] = useState("");
  const [tipo, setTipo] = useState<TipoRescisao>("sem-justa-causa");
  const [aviso, setAviso] = useState("indenizado");
  const [feriasVenc, setFeriasVenc] = useState("nao");
  const [fgts, setFgts] = useState("");
  const [res, setRes] = useState<RescisaoResultado | null>(null);

  function calcular() {
    const s = parseNumber(salario);
    if (!isFinite(s) || s <= 0 || !admissao || !demissao) return;
    setRes(
      calcRescisao({
        salario: s,
        admissao,
        demissao,
        tipo,
        avisoTrabalhado: aviso === "trabalhado",
        feriasVencidas: feriasVenc === "sim",
        saldoFgts: parseNumber(fgts) || 0,
      }),
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          calcular();
        }}
        className="space-y-4"
      >
        <Field label="Motivo do desligamento">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoRescisao)}>
            <option value="sem-justa-causa">Demissão sem justa causa</option>
            <option value="pedido">Pedido de demissão</option>
            <option value="acordo">Acordo (comum acordo)</option>
            <option value="justa-causa">Demissão por justa causa</option>
          </Select>
        </Field>
        <Field label="Salário mensal (bruto)">
          <Input
            inputMode="decimal"
            placeholder="Ex.: 2.500,00"
            value={salario}
            onChange={(e) => setSalario(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Admissão">
            <Input type="date" value={admissao} onChange={(e) => setAdmissao(e.target.value)} />
          </Field>
          <Field label="Desligamento">
            <Input type="date" value={demissao} onChange={(e) => setDemissao(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Aviso prévio">
            <Select value={aviso} onChange={(e) => setAviso(e.target.value)}>
              <option value="indenizado">Indenizado</option>
              <option value="trabalhado">Trabalhado</option>
            </Select>
          </Field>
          <Field label="Tem férias vencidas?">
            <Select value={feriasVenc} onChange={(e) => setFeriasVenc(e.target.value)}>
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </Select>
          </Field>
        </div>
        <Field label="Saldo do FGTS (opcional)" hint="Para estimar a multa de 40%/20%.">
          <Input
            inputMode="decimal"
            placeholder="Ex.: 5.000,00"
            value={fgts}
            onChange={(e) => setFgts(e.target.value)}
          />
        </Field>
        <Button type="submit">Calcular acerto</Button>
      </form>

      <div>
        {res ? (
          <ResultBox tone="trabalhista">
            <p className="mb-2 text-sm font-medium text-muted">Total estimado a receber</p>
            <p className="mb-4 text-3xl font-extrabold text-foreground">
              {formatBRL(res.total)}
            </p>
            <Row label="Saldo de salário" value={formatBRL(res.saldoSalario)} />
            {res.aviso > 0 && <Row label="Aviso prévio indenizado" value={formatBRL(res.aviso)} />}
            {res.decimo > 0 && <Row label="13º proporcional" value={formatBRL(res.decimo)} />}
            {res.feriasProp > 0 && (
              <Row
                label="Férias proporcionais + 1/3"
                value={formatBRL(res.feriasProp + res.tercoFerias)}
              />
            )}
            {res.feriasVencidas > 0 && (
              <Row label="Férias vencidas + 1/3" value={formatBRL(res.feriasVencidas)} />
            )}
            {res.multaFgts > 0 && <Row label="Multa do FGTS" value={formatBRL(res.multaFgts)} />}
            <Row label="Total estimado" value={formatBRL(res.total)} strong />
            <p className="mt-3 text-xs text-muted">
              Estimativa de verbas rescisórias ({res.mesesTrabalhados} meses de
              casa). Não desconta INSS/IRRF nem inclui médias de horas extras,
              comissões ou adicionais. Confira com o RH ou um profissional.
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Preencha os dados para estimar quanto você tem a receber.
          </div>
        )}
      </div>
    </div>
  );
}
