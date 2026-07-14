"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row, Select } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, parseNumber } from "@/lib/format";

function Freelancer() {
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

function HoraExtra() {
  const [salario, setSalario] = useState("");
  const [jornada, setJornada] = useState("220");
  const [qtd, setQtd] = useState("");
  const [adicional, setAdicional] = useState("50");
  const [res, setRes] = useState<{
    horaNormal: number;
    horaExtra: number;
    total: number;
    adic: number;
  } | null>(null);

  function calcular() {
    const s = parseNumber(salario);
    const j = parseNumber(jornada) || 220;
    if (!isFinite(s) || s <= 0 || j <= 0) return;
    const adic = parseNumber(adicional) || 0;
    const horaNormal = round2(s / j);
    const horaExtra = round2(horaNormal * (1 + adic / 100));
    const q = parseNumber(qtd) || 0;
    setRes({
      horaNormal,
      horaExtra,
      total: round2(horaExtra * q),
      adic,
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
        <Field label="Salário mensal (bruto)">
          <Input
            inputMode="decimal"
            placeholder="Ex.: 2.200,00"
            value={salario}
            onChange={(e) => setSalario(e.target.value)}
          />
        </Field>
        <Field
          label="Jornada mensal (horas)"
          hint="Padrão 220 h/mês para jornada de 44 h/semana."
        >
          <Input
            inputMode="numeric"
            value={jornada}
            onChange={(e) => setJornada(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Adicional">
            <Select
              value={adicional}
              onChange={(e) => setAdicional(e.target.value)}
            >
              <option value="50">50% (dia comum)</option>
              <option value="100">100% (domingo/feriado)</option>
              <option value="60">60%</option>
              <option value="70">70%</option>
            </Select>
          </Field>
          <Field label="Qtd. de horas extras" hint="No mês (opcional).">
            <Input
              inputMode="numeric"
              placeholder="Ex.: 10"
              value={qtd}
              onChange={(e) => setQtd(e.target.value)}
            />
          </Field>
        </div>
        <Button type="submit">Calcular hora extra</Button>
      </form>

      <div>
        {res ? (
          <ResultBox tone="trabalhista">
            <p className="mb-2 text-sm font-medium text-muted">
              Valor da hora extra ({res.adic}%)
            </p>
            <p className="mb-4 text-3xl font-extrabold text-foreground">
              {formatBRL(res.horaExtra)}
            </p>
            <Row label="Valor da hora normal" value={formatBRL(res.horaNormal)} />
            <Row
              label={`Hora extra (+${res.adic}%)`}
              value={formatBRL(res.horaExtra)}
            />
            {res.total > 0 && (
              <Row
                label="Total das horas extras"
                value={formatBRL(res.total)}
                strong
              />
            )}
            <p className="mt-3 text-xs text-muted">
              Estimativa: hora normal = salário ÷ jornada mensal; a hora extra
              acrescenta o adicional. Não inclui reflexos em DSR, férias e 13º.
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Informe o salário e a jornada para calcular o valor da hora extra.
          </div>
        )}
      </div>
    </div>
  );
}

export default function ValorHora() {
  const [tab, setTab] = useState<"freelancer" | "extra">("freelancer");
  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full border border-border bg-surface p-1">
        {(
          [
            ["freelancer", "Quanto cobrar (freelancer)"],
            ["extra", "Hora extra (CLT)"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`focus-ring rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === id ? "bg-brand text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "freelancer" ? <Freelancer /> : <HoraExtra />}
    </div>
  );
}
