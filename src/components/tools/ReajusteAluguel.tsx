"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row, Select } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, formatPercent, parseNumber } from "@/lib/format";
import {
  addMeses,
  carregarIndice,
  fatorAcumulado,
  INDICES,
  mesLabel,
  type IndiceId,
  type IndiceMensal,
} from "@/lib/bcb";

function mesAtual(): string {
  return new Date().toISOString().slice(0, 7);
}

interface Resultado {
  atual: number;
  novo: number;
  percentual: number;
  meses: IndiceMensal[];
  aviso?: string;
  indice: IndiceId;
}

export default function ReajusteAluguel() {
  const [valor, setValor] = useState("");
  const [indice, setIndice] = useState<IndiceId>("igpm");
  const [mesReajuste, setMesReajuste] = useState(mesAtual());
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [res, setRes] = useState<Resultado | null>(null);

  async function calcular() {
    const v = parseNumber(valor);
    if (!isFinite(v) || v <= 0 || !mesReajuste) return;
    setErro("");
    setLoading(true);
    try {
      const dados = await carregarIndice(indice);
      // Acumulado dos 12 meses anteriores ao mês do reajuste.
      let fim = addMeses(mesReajuste, -1);
      let aviso: string | undefined;
      const ultimo = dados[dados.length - 1]?.m;
      if (ultimo && fim > ultimo) {
        aviso = `O índice de ${mesLabel(fim)} ainda não foi divulgado. Usamos os 12 meses mais recentes disponíveis (até ${mesLabel(ultimo)}).`;
        fim = ultimo;
      }
      const inicio = addMeses(fim, -11);
      const meses = dados.filter((d) => d.m >= inicio && d.m <= fim);
      if (meses.length < 12) throw new Error("Não há dados suficientes para esse período.");
      const pct = (fatorAcumulado(meses) - 1) * 100;
      setRes({
        atual: v,
        novo: round2(v * (1 + pct / 100)),
        percentual: pct,
        meses,
        aviso,
        indice,
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao calcular.");
    } finally {
      setLoading(false);
    }
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
        <Field label="Valor atual do aluguel">
          <Input inputMode="decimal" placeholder="Ex.: 1.800,00" value={valor} onChange={(e) => setValor(e.target.value)} />
        </Field>
        <Field label="Índice do contrato" hint={INDICES[indice].descricao}>
          <Select value={indice} onChange={(e) => setIndice(e.target.value as IndiceId)}>
            <option value="igpm">IGP-M (FGV)</option>
            <option value="ipca">IPCA (IBGE)</option>
            <option value="inpc">INPC (IBGE)</option>
          </Select>
        </Field>
        <Field label="Mês do reajuste (aniversário do contrato)" hint="Usamos o índice acumulado nos 12 meses anteriores.">
          <Input type="month" value={mesReajuste} onChange={(e) => setMesReajuste(e.target.value)} />
        </Field>
        <Button type="submit" disabled={loading}>
          {loading ? "Buscando índice…" : "Calcular reajuste"}
        </Button>
        {erro && <p className="text-sm text-rose-600">{erro}</p>}
      </form>

      <div>
        {res ? (
          <ResultBox tone="financas">
            <p className="mb-2 text-sm font-medium text-muted">Novo valor do aluguel</p>
            <p className="mb-4 text-3xl font-extrabold text-foreground">{formatBRL(res.novo)}</p>
            <Row label="Aluguel atual" value={formatBRL(res.atual)} />
            <Row
              label={`${INDICES[res.indice].nome} acumulado 12 meses`}
              value={formatPercent(res.percentual)}
            />
            <Row
              label="Diferença por mês"
              value={`${res.novo >= res.atual ? "+" : "−"} ${formatBRL(Math.abs(res.novo - res.atual))}`}
            />
            <Row label="Novo aluguel" value={formatBRL(res.novo)} strong />
            <p className="mt-2 text-xs text-muted">
              Período: {mesLabel(res.meses[0].m)} a {mesLabel(res.meses[res.meses.length - 1].m)}.
            </p>
            {res.percentual < 0 && (
              <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                O índice ficou negativo. Muitos contratos preveem que, nesse caso, o aluguel
                simplesmente se mantém — confira a cláusula de reajuste do seu contrato.
              </p>
            )}
            {res.aviso && <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">{res.aviso}</p>}
            <details className="mt-3 text-xs text-muted">
              <summary className="cursor-pointer font-medium">Ver os 12 meses</summary>
              <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 tabular-nums">
                {res.meses.map((m) => (
                  <li key={m.m} className="flex justify-between">
                    <span>{mesLabel(m.m)}</span>
                    <span>{formatPercent(m.v)}</span>
                  </li>
                ))}
              </ul>
            </details>
            <p className="mt-3 text-xs text-muted">Fonte: Banco Central do Brasil (SGS).</p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Informe o aluguel, o índice e o mês do reajuste para ver o novo valor.
          </div>
        )}
      </div>
    </div>
  );
}
