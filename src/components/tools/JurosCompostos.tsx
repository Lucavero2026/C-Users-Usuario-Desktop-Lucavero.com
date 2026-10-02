"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row, Select } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, parseNumber } from "@/lib/format";

interface Ano {
  ano: number;
  investido: number;
  juros: number;
  total: number;
}

interface Resultado {
  total: number;
  investido: number;
  juros: number;
  anos: Ano[];
  meses: number;
}

/** Simulação mês a mês: rende sobre o saldo e o aporte entra no fim do mês. */
function simular(inicial: number, aporte: number, taxaMes: number, meses: number): Resultado {
  let saldo = inicial;
  let investido = inicial;
  const anos: Ano[] = [];
  for (let m = 1; m <= meses; m++) {
    saldo = saldo * (1 + taxaMes) + aporte;
    investido += aporte;
    if (m % 12 === 0 || m === meses) {
      anos.push({
        ano: Math.ceil(m / 12),
        investido: round2(investido),
        juros: round2(saldo - investido),
        total: round2(saldo),
      });
    }
  }
  return { total: round2(saldo), investido: round2(investido), juros: round2(saldo - investido), anos, meses };
}

export default function JurosCompostos() {
  const [inicial, setInicial] = useState("1.000,00");
  const [aporte, setAporte] = useState("300,00");
  const [taxa, setTaxa] = useState("1");
  const [tipoTaxa, setTipoTaxa] = useState<"mes" | "ano">("mes");
  const [prazo, setPrazo] = useState("10");
  const [tipoPrazo, setTipoPrazo] = useState<"anos" | "meses">("anos");
  const [res, setRes] = useState<Resultado | null>(null);

  function calcular() {
    const c = parseNumber(inicial) || 0;
    const a = parseNumber(aporte) || 0;
    const t = (parseNumber(taxa) || 0) / 100;
    const p = parseInt(prazo || "0", 10) || 0;
    const meses = tipoPrazo === "anos" ? p * 12 : p;
    if (meses <= 0 || meses > 1200 || (c <= 0 && a <= 0)) return;
    const taxaMes = tipoTaxa === "mes" ? t : Math.pow(1 + t, 1 / 12) - 1;
    setRes(simular(c, a, taxaMes, meses));
  }

  const max = res ? Math.max(...res.anos.map((a) => a.total)) : 1;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            calcular();
          }}
          className="space-y-4"
        >
          <Field label="Valor inicial">
            <Input inputMode="decimal" value={inicial} onChange={(e) => setInicial(e.target.value)} />
          </Field>
          <Field label="Aporte mensal" hint="Quanto você vai guardar todo mês (pode ser zero).">
            <Input inputMode="decimal" value={aporte} onChange={(e) => setAporte(e.target.value)} />
          </Field>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="Taxa de juros (%)">
              <Input inputMode="decimal" value={taxa} onChange={(e) => setTaxa(e.target.value)} />
            </Field>
            <Field label="Período da taxa">
              <Select value={tipoTaxa} onChange={(e) => setTipoTaxa(e.target.value as "mes" | "ano")}>
                <option value="mes">ao mês</option>
                <option value="ano">ao ano</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="Prazo">
              <Input inputMode="numeric" value={prazo} onChange={(e) => setPrazo(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Em">
              <Select value={tipoPrazo} onChange={(e) => setTipoPrazo(e.target.value as "anos" | "meses")}>
                <option value="anos">anos</option>
                <option value="meses">meses</option>
              </Select>
            </Field>
          </div>
          <Button type="submit">Calcular</Button>
        </form>

        <div>
          {res ? (
            <ResultBox tone="financas">
              <p className="mb-2 text-sm font-medium text-muted">Valor acumulado</p>
              <p className="mb-4 text-3xl font-extrabold text-foreground">{formatBRL(res.total)}</p>
              <Row label="Total investido" value={formatBRL(res.investido)} />
              <Row label="Total em juros" value={`+ ${formatBRL(res.juros)}`} />
              <Row label="Valor final" value={formatBRL(res.total)} strong />
              <p className="mt-3 text-sm text-foreground/80">
                Os juros representam{" "}
                <strong>{res.total > 0 ? Math.round((res.juros / res.total) * 100) : 0}%</strong> do valor
                final — é o efeito “bola de neve” dos juros compostos.
              </p>
              <p className="mt-3 text-xs text-muted">
                Simulação sem impostos e taxas. Aportes no fim de cada mês.
              </p>
            </ResultBox>
          ) : (
            <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
              Preencha os campos e veja quanto o seu dinheiro pode crescer.
            </div>
          )}
        </div>
      </div>

      {res && res.anos.length > 1 && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">Evolução ano a ano</h3>
            <div className="flex gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-indigo-300 dark:bg-indigo-700" /> Investido</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Juros</span>
            </div>
          </div>
          <div className="flex h-48 items-end gap-1" role="img" aria-label="Gráfico da evolução do patrimônio">
            {res.anos.map((a) => (
              <div
                key={a.ano}
                className="flex flex-1 flex-col justify-end"
                title={`Ano ${a.ano}: ${formatBRL(a.total)}`}
                style={{ height: `${(a.total / max) * 100}%` }}
              >
                <div className="rounded-t-sm bg-emerald-500" style={{ height: `${(a.juros / a.total) * 100}%` }} />
                <div className="bg-indigo-300 dark:bg-indigo-700" style={{ height: `${(a.investido / a.total) * 100}%` }} />
              </div>
            ))}
          </div>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-medium">Ver tabela</summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-right tabular-nums">
                <thead className="text-xs text-muted">
                  <tr>
                    <th className="py-1 text-left">Ano</th>
                    <th>Investido</th>
                    <th>Juros</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {res.anos.map((a) => (
                    <tr key={a.ano} className="border-t border-border">
                      <td className="py-1 text-left">{a.ano}</td>
                      <td>{formatBRL(a.investido)}</td>
                      <td>{formatBRL(a.juros)}</td>
                      <td className="font-semibold">{formatBRL(a.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
