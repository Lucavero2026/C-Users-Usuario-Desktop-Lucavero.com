"use client";

import { useEffect, useState } from "react";
import { Button, Field, Input, ResultBox, Row, Select } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, parseNumber } from "@/lib/format";
import { carregarTaxas } from "@/lib/bcb";

const PERFIS = {
  servidor: { label: "Servidor público / renda muito estável", meses: 3 },
  clt: { label: "CLT (carteira assinada)", meses: 6 },
  autonomo: { label: "Autônomo, MEI ou renda variável", meses: 12 },
} as const;
type Perfil = keyof typeof PERFIS;

interface Resultado {
  meta: number;
  falta: number;
  mesesParaMeta: number | null;
  mesesReserva: number;
  progresso: number;
}

export default function ReservaEmergencia() {
  const [custo, setCusto] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("clt");
  const [atual, setAtual] = useState("");
  const [aporte, setAporte] = useState("");
  const [cdi, setCdi] = useState(10);
  const [res, setRes] = useState<Resultado | null>(null);

  useEffect(() => {
    carregarTaxas().then((t) => setCdi(t.cdi)).catch(() => {});
  }, []);

  function calcular() {
    const c = parseNumber(custo);
    if (!isFinite(c) || c <= 0) return;
    const ja = parseNumber(atual) || 0;
    const ap = parseNumber(aporte) || 0;
    const mesesReserva = PERFIS[perfil].meses;
    const meta = round2(c * mesesReserva);
    const falta = round2(Math.max(0, meta - ja));
    // Tempo até a meta guardando "ap" por mês num investimento a 100% do CDI.
    let mesesParaMeta: number | null = 0;
    if (falta > 0) {
      if (ap <= 0) mesesParaMeta = null;
      else {
        const i = Math.pow(1 + cdi / 100, 1 / 12) - 1;
        let saldo = ja;
        let m = 0;
        while (saldo < meta && m < 600) {
          saldo = saldo * (1 + i) + ap;
          m++;
        }
        mesesParaMeta = m;
      }
    }
    setRes({ meta, falta, mesesParaMeta, mesesReserva, progresso: Math.min(100, (ja / meta) * 100) });
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
        <Field label="Seu custo de vida mensal" hint="Aluguel, contas, mercado, transporte… o essencial do mês.">
          <Input inputMode="decimal" placeholder="Ex.: 3.500,00" value={custo} onChange={(e) => setCusto(e.target.value)} />
        </Field>
        <Field label="Como é a sua renda?">
          <Select value={perfil} onChange={(e) => setPerfil(e.target.value as Perfil)}>
            {Object.entries(PERFIS).map(([k, p]) => (
              <option key={k} value={k}>
                {p.label} — {p.meses} meses
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quanto já tem guardado">
            <Input inputMode="decimal" placeholder="0,00" value={atual} onChange={(e) => setAtual(e.target.value)} />
          </Field>
          <Field label="Quanto consegue guardar/mês">
            <Input inputMode="decimal" placeholder="Ex.: 500,00" value={aporte} onChange={(e) => setAporte(e.target.value)} />
          </Field>
        </div>
        <Button type="submit">Calcular minha reserva</Button>
      </form>

      <div>
        {res ? (
          <ResultBox tone="financas">
            <p className="mb-2 text-sm font-medium text-muted">Sua reserva de emergência ideal</p>
            <p className="mb-3 text-3xl font-extrabold text-foreground">{formatBRL(res.meta)}</p>
            <div className="mb-4 h-3 overflow-hidden rounded-full bg-white/60 dark:bg-black/20">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${res.progresso}%` }} />
            </div>
            <Row label="Equivale a" value={`${res.mesesReserva} meses de custo de vida`} />
            <Row label="Você já tem" value={`${Math.round(res.progresso)}% da meta`} />
            <Row label="Falta juntar" value={formatBRL(res.falta)} strong />
            <p className="mt-3 text-sm text-foreground/80">
              {res.falta === 0
                ? "Parabéns: sua reserva está completa! A partir daqui, o dinheiro extra pode ir para objetivos de longo prazo."
                : res.mesesParaMeta === null
                  ? "Informe quanto consegue guardar por mês para saber em quanto tempo chega lá."
                  : `Guardando esse valor por mês num investimento que rende 100% do CDI, você completa a reserva em cerca de ${res.mesesParaMeta} ${res.mesesParaMeta === 1 ? "mês" : "meses"}.`}
            </p>
            <p className="mt-3 text-xs text-muted">
              Onde deixar: aplicações seguras e com resgate imediato (liquidez diária), como Tesouro
              Selic, CDB de liquidez diária de banco grande ou conta remunerada.
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Informe seu custo de vida para descobrir o tamanho ideal da sua reserva.
          </div>
        )}
      </div>
    </div>
  );
}
