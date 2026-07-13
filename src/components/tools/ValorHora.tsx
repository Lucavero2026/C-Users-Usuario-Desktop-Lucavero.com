"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, parseNumber } from "@/lib/format";

export default function ValorHora() {
  const [meta, setMeta] = useState("");
  const [custos, setCustos] = useState("");
  const [diasSemana, setDiasSemana] = useState("5");
  const [horasDia, setHorasDia] = useState("8");
  const [faturavel, setFaturavel] = useState("70");
  const [margem, setMargem] = useState("20");
  const [res, setRes] = useState<{
    hora: number;
    dia: number;
    horasFaturaveis: number;
    receita: number;
  } | null>(null);

  function calcular() {
    const m = parseNumber(meta);
    if (!isFinite(m) || m <= 0) return;
    const c = parseNumber(custos) || 0;
    const dias = parseNumber(diasSemana) || 5;
    const horas = parseNumber(horasDia) || 8;
    const fat = (parseNumber(faturavel) || 70) / 100;
    const marg = (parseNumber(margem) || 0) / 100;

    const horasMes = horas * dias * 4.33;
    const horasFaturaveis = Math.max(1, horasMes * fat);
    const receita = (m + c) * (1 + marg);
    const hora = round2(receita / horasFaturaveis);
    setRes({
      hora,
      dia: round2(hora * horas * fat),
      horasFaturaveis: Math.round(horasFaturaveis),
      receita: round2(receita),
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
        <Field label="Quanto quer ganhar por mês" hint="Sua meta de retirada líquida.">
          <Input
            inputMode="decimal"
            placeholder="Ex.: 5.000,00"
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
          />
        </Field>
        <Field
          label="Custos fixos mensais"
          hint="Internet, softwares, equipamentos, contador, etc."
        >
          <Input
            inputMode="decimal"
            placeholder="Ex.: 800,00"
            value={custos}
            onChange={(e) => setCustos(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dias/semana">
            <Input
              inputMode="numeric"
              value={diasSemana}
              onChange={(e) => setDiasSemana(e.target.value)}
            />
          </Field>
          <Field label="Horas/dia">
            <Input
              inputMode="numeric"
              value={horasDia}
              onChange={(e) => setHorasDia(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="% tempo faturável" hint="Nem toda hora é vendável.">
            <Input
              inputMode="numeric"
              value={faturavel}
              onChange={(e) => setFaturavel(e.target.value)}
            />
          </Field>
          <Field label="% impostos/reserva">
            <Input
              inputMode="numeric"
              value={margem}
              onChange={(e) => setMargem(e.target.value)}
            />
          </Field>
        </div>
        <Button type="submit">Calcular valor da hora</Button>
      </form>

      <div>
        {res ? (
          <ResultBox tone="trabalhista">
            <p className="mb-2 text-sm font-medium text-muted">
              Cobre por hora, no mínimo
            </p>
            <p className="mb-4 text-3xl font-extrabold text-foreground">
              {formatBRL(res.hora)}
            </p>
            <Row label="Sugestão por diária" value={formatBRL(res.dia)} />
            <Row
              label="Horas faturáveis/mês"
              value={`${res.horasFaturaveis} h`}
            />
            <Row
              label="Receita-alvo mensal"
              value={formatBRL(res.receita)}
              strong
            />
            <p className="mt-3 text-xs text-muted">
              Estimativa: some sua meta e custos, divida pelas horas realmente
              faturáveis e acrescente margem para impostos e imprevistos.
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Preencha seus números para descobrir quanto cobrar por hora.
          </div>
        )}
      </div>
    </div>
  );
}
