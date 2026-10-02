"use client";

import { useEffect, useState } from "react";
import { Button, Field, Input, ResultBox, Row, Select } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, formatNumber, formatPercent, parseNumber } from "@/lib/format";
import { carregarIndice, fatorAcumulado, INDICES, mesLabel, type IndiceId } from "@/lib/bcb";

interface Resultado {
  original: number;
  corrigido: number;
  fator: number;
  percentual: number;
  de: string;
  ate: string;
  indice: IndiceId;
}

export default function CorrecaoInflacao() {
  const [valor, setValor] = useState("");
  const [indice, setIndice] = useState<IndiceId>("ipca");
  const [de, setDe] = useState("2020-01");
  const [ate, setAte] = useState("");
  const [ultimoMes, setUltimoMes] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [res, setRes] = useState<Resultado | null>(null);

  // Descobre o último mês divulgado para sugerir como data final.
  useEffect(() => {
    carregarIndice(indice)
      .then((d) => {
        const ultimo = d[d.length - 1]?.m || "";
        setUltimoMes(ultimo);
        setAte((a) => (!a || a > ultimo ? ultimo : a));
      })
      .catch(() => {});
  }, [indice]);

  async function calcular() {
    const v = parseNumber(valor);
    if (!isFinite(v) || v <= 0 || !de || !ate) return;
    if (de > ate) {
      setErro("A data inicial precisa ser anterior à final.");
      return;
    }
    setErro("");
    setLoading(true);
    try {
      const dados = await carregarIndice(indice);
      const meses = dados.filter((d) => d.m >= de && d.m <= ate);
      if (!meses.length) throw new Error("Não há dados do índice para esse período.");
      const fator = fatorAcumulado(meses);
      setRes({
        original: v,
        corrigido: round2(v * fator),
        fator,
        percentual: (fator - 1) * 100,
        de: meses[0].m,
        ate: meses[meses.length - 1].m,
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
        <Field label="Valor a corrigir">
          <Input inputMode="decimal" placeholder="Ex.: 1.000,00" value={valor} onChange={(e) => setValor(e.target.value)} />
        </Field>
        <Field label="Índice de inflação" hint={INDICES[indice].descricao}>
          <Select value={indice} onChange={(e) => setIndice(e.target.value as IndiceId)}>
            <option value="ipca">IPCA (inflação oficial)</option>
            <option value="inpc">INPC</option>
            <option value="igpm">IGP-M</option>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="De (mês inicial)">
            <Input type="month" min="1995-01" value={de} onChange={(e) => setDe(e.target.value)} />
          </Field>
          <Field label="Até (mês final)" hint={ultimoMes ? `Último divulgado: ${mesLabel(ultimoMes)}` : undefined}>
            <Input type="month" max={ultimoMes || undefined} value={ate} onChange={(e) => setAte(e.target.value)} />
          </Field>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Calculando…" : "Corrigir valor"}
        </Button>
        {erro && <p className="text-sm text-rose-600">{erro}</p>}
      </form>

      <div>
        {res ? (
          <ResultBox tone="financas">
            <p className="mb-2 text-sm font-medium text-muted">Valor corrigido</p>
            <p className="mb-4 text-3xl font-extrabold text-foreground">{formatBRL(res.corrigido)}</p>
            <Row label="Valor original" value={formatBRL(res.original)} />
            <Row label={`${INDICES[res.indice].nome} no período`} value={formatPercent(res.percentual)} />
            <Row label="Fator de correção" value={formatNumber(res.fator, 6)} />
            <Row label="Valor corrigido" value={formatBRL(res.corrigido)} strong />
            <p className="mt-3 text-sm text-foreground/80">
              {res.percentual >= 0
                ? `Para comprar hoje o mesmo que ${formatBRL(res.original)} compravam em ${mesLabel(res.de)}, você precisa de ${formatBRL(res.corrigido)}.`
                : `No período houve deflação: os preços caíram ${formatPercent(Math.abs(res.percentual))}.`}
            </p>
            <p className="mt-3 text-xs text-muted">
              Índices de {mesLabel(res.de)} a {mesLabel(res.ate)} (inclusive). Fonte: Banco Central do
              Brasil (SGS).
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Informe o valor e o período para atualizar pela inflação.
          </div>
        )}
      </div>
    </div>
  );
}
