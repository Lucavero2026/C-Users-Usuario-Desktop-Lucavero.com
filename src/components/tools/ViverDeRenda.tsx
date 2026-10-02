"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, formatPercent, parseNumber } from "@/lib/format";

interface Resultado {
  necessario: number;
  anos: number | null;
  meses: number | null;
  rendaHoje: number;
  retirada: number;
}

export default function ViverDeRenda() {
  const [renda, setRenda] = useState("5.000,00");
  const [retirada, setRetirada] = useState("4");
  const [patrimonio, setPatrimonio] = useState("");
  const [aporte, setAporte] = useState("1.000,00");
  const [taxaReal, setTaxaReal] = useState("4");
  const [res, setRes] = useState<Resultado | null>(null);

  function calcular() {
    const r = parseNumber(renda);
    const ret = (parseNumber(retirada) || 0) / 100;
    if (!isFinite(r) || r <= 0 || ret <= 0) return;
    const necessario = round2((r * 12) / ret);
    const p0 = parseNumber(patrimonio) || 0;
    const ap = parseNumber(aporte) || 0;
    const iMes = Math.pow(1 + (parseNumber(taxaReal) || 0) / 100, 1 / 12) - 1;

    let saldo = p0;
    let m = 0;
    while (saldo < necessario && m < 1200) {
      saldo = saldo * (1 + iMes) + ap;
      m++;
    }
    const chega = saldo >= necessario;
    setRes({
      necessario,
      anos: chega ? Math.floor(m / 12) : null,
      meses: chega ? m % 12 : null,
      rendaHoje: round2((p0 * ret) / 12),
      retirada: ret * 100,
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
        <Field label="Renda mensal que você quer ter" hint="Em valores de hoje.">
          <Input inputMode="decimal" value={renda} onChange={(e) => setRenda(e.target.value)} />
        </Field>
        <Field
          label="Taxa de retirada anual (%)"
          hint="Quanto do patrimônio você saca por ano. 4% é a referência mais usada (“regra dos 4%”)."
        >
          <Input inputMode="decimal" value={retirada} onChange={(e) => setRetirada(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Patrimônio atual">
            <Input inputMode="decimal" placeholder="0,00" value={patrimonio} onChange={(e) => setPatrimonio(e.target.value)} />
          </Field>
          <Field label="Aporte mensal">
            <Input inputMode="decimal" value={aporte} onChange={(e) => setAporte(e.target.value)} />
          </Field>
        </div>
        <Field
          label="Rentabilidade real (% ao ano, acima da inflação)"
          hint="Use um valor conservador, como 3% a 5%."
        >
          <Input inputMode="decimal" value={taxaReal} onChange={(e) => setTaxaReal(e.target.value)} />
        </Field>
        <Button type="submit">Calcular</Button>
      </form>

      <div>
        {res ? (
          <ResultBox tone="financas">
            <p className="mb-2 text-sm font-medium text-muted">Patrimônio para viver de renda</p>
            <p className="mb-4 text-3xl font-extrabold text-foreground">{formatBRL(res.necessario)}</p>
            <Row label="Taxa de retirada" value={`${formatPercent(res.retirada, 1)} ao ano`} />
            <Row label="Renda que seu patrimônio gera hoje" value={`${formatBRL(res.rendaHoje)}/mês`} />
            <Row
              label="Tempo até a independência"
              value={
                res.anos === null
                  ? "mais de 100 anos"
                  : `${res.anos} ano(s)${res.meses ? ` e ${res.meses} mês(es)` : ""}`
              }
              strong
            />
            <p className="mt-3 text-sm text-foreground/80">
              {res.anos === null
                ? "Com esse aporte, a meta fica fora de alcance. Experimente aumentar o aporte ou reduzir a renda desejada."
                : "Aumentar o aporte, mesmo que pouco, é o que mais encurta esse prazo — teste valores diferentes."}
            </p>
            <p className="mt-3 text-xs text-muted">
              Valores em reais de hoje (a rentabilidade já desconta a inflação). Simulação
              educativa, sem impostos; não é recomendação de investimento.
            </p>
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Descubra quanto você precisa juntar para viver de renda e em quanto tempo chega lá.
          </div>
        )}
      </div>
    </div>
  );
}
