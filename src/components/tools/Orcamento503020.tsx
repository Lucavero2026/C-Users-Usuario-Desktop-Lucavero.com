"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, parseNumber } from "@/lib/format";

const FAIXAS = [
  {
    id: "necessidades",
    nome: "Necessidades",
    pct: 50,
    cor: "bg-indigo-500",
    exemplos: "Aluguel, contas de casa, mercado, transporte, saúde, escola.",
  },
  {
    id: "desejos",
    nome: "Desejos",
    pct: 30,
    cor: "bg-amber-500",
    exemplos: "Lazer, restaurantes, streaming, compras, viagens.",
  },
  {
    id: "futuro",
    nome: "Futuro (poupar e investir)",
    pct: 20,
    cor: "bg-emerald-500",
    exemplos: "Reserva de emergência, investimentos, quitar dívidas.",
  },
] as const;

type Gastos = Record<(typeof FAIXAS)[number]["id"], string>;

export default function Orcamento503020() {
  const [renda, setRenda] = useState("");
  const [gastos, setGastos] = useState<Gastos>({ necessidades: "", desejos: "", futuro: "" });
  const [calc, setCalc] = useState<number | null>(null);

  const temGastos = Object.values(gastos).some((g) => parseNumber(g) > 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const r = parseNumber(renda);
          if (isFinite(r) && r > 0) setCalc(r);
        }}
        className="space-y-4"
      >
        <Field label="Sua renda líquida mensal" hint="O que cai na conta, já sem descontos.">
          <Input inputMode="decimal" placeholder="Ex.: 4.000,00" value={renda} onChange={(e) => setRenda(e.target.value)} />
        </Field>
        <div className="rounded-2xl border border-border p-4">
          <p className="mb-3 text-sm font-medium">
            Opcional: quanto você gasta hoje em cada grupo?
          </p>
          <div className="space-y-3">
            {FAIXAS.map((f) => (
              <Field key={f.id} label={f.nome} hint={f.exemplos}>
                <Input
                  inputMode="decimal"
                  placeholder="0,00"
                  value={gastos[f.id]}
                  onChange={(e) => setGastos((g) => ({ ...g, [f.id]: e.target.value }))}
                />
              </Field>
            ))}
          </div>
        </div>
        <Button type="submit">Montar meu orçamento</Button>
      </form>

      <div>
        {calc ? (
          <ResultBox tone="financas">
            <p className="mb-3 text-sm font-medium text-muted">Como dividir {formatBRL(calc)} por mês</p>
            <div className="mb-5 flex h-4 overflow-hidden rounded-full">
              {FAIXAS.map((f) => (
                <div key={f.id} className={f.cor} style={{ width: `${f.pct}%` }} />
              ))}
            </div>
            <div className="space-y-4">
              {FAIXAS.map((f) => {
                const ideal = round2((calc * f.pct) / 100);
                const real = parseNumber(gastos[f.id]) || 0;
                const dif = real - ideal;
                const ruim = f.id === "futuro" ? dif < 0 : dif > 0;
                return (
                  <div key={f.id}>
                    <div className="flex items-baseline justify-between">
                      <span className="flex items-center gap-2 font-semibold">
                        <span className={`h-2.5 w-2.5 rounded-full ${f.cor}`} />
                        {f.pct}% · {f.nome}
                      </span>
                      <span className="text-lg font-bold tabular-nums">{formatBRL(ideal)}</span>
                    </div>
                    {temGastos && (
                      <p className={`mt-0.5 text-xs ${ruim && Math.abs(dif) > 0.5 ? "text-rose-600" : "text-emerald-700 dark:text-emerald-400"}`}>
                        Hoje: {formatBRL(real)} ({calc > 0 ? Math.round((real / calc) * 100) : 0}%) ·{" "}
                        {Math.abs(dif) < 0.5
                          ? "no alvo"
                          : f.id === "futuro"
                            ? dif < 0
                              ? `guarde mais ${formatBRL(-dif)}`
                              : `acima da meta em ${formatBRL(dif)} 👏`
                            : dif > 0
                              ? `corte ${formatBRL(dif)}`
                              : `sobra ${formatBRL(-dif)}`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted">
              A regra 50/30/20 é um ponto de partida. Com renda apertada, as necessidades podem
              passar de 50% — o importante é sempre separar algo para o futuro.
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Informe sua renda para ver quanto destinar a cada parte do orçamento.
          </div>
        )}
      </div>
    </div>
  );
}
