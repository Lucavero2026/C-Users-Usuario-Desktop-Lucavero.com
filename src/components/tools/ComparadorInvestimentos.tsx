"use client";

import { useEffect, useState } from "react";
import { Button, Field, Input, ResultBox } from "@/components/ui";
import { round2 } from "@/lib/br";
import { formatBRL, formatNumber, formatPercent, parseNumber } from "@/lib/format";
import { carregarTaxas, type TaxasAtuais } from "@/lib/bcb";

/** IR regressivo de renda fixa conforme o prazo (dias corridos). */
function aliquotaIR(dias: number): number {
  if (dias <= 180) return 0.225;
  if (dias <= 360) return 0.2;
  if (dias <= 720) return 0.175;
  return 0.15;
}

interface Linha {
  nome: string;
  detalhe: string;
  bruto: number;
  ir: number;
  liquido: number;
  rendimento: number;
  isento: boolean;
}

export default function ComparadorInvestimentos() {
  const [taxas, setTaxas] = useState<TaxasAtuais | null>(null);
  const [erroTaxas, setErroTaxas] = useState(false);
  const [valor, setValor] = useState("10.000,00");
  const [meses, setMeses] = useState("12");
  const [cdi, setCdi] = useState("");
  const [selic, setSelic] = useState("");
  const [pctCdb, setPctCdb] = useState("100");
  const [pctLci, setPctLci] = useState("90");
  const [poup, setPoup] = useState("");
  const [linhas, setLinhas] = useState<Linha[] | null>(null);

  useEffect(() => {
    carregarTaxas()
      .then((t) => {
        setTaxas(t);
        setCdi(formatNumber(t.cdi, 2));
        setSelic(formatNumber(t.selic, 2));
        setPoup(formatNumber(t.poupanca, 4));
      })
      .catch(() => {
        setErroTaxas(true);
        setCdi("10,00");
        setSelic("10,15");
        setPoup("0,6");
      });
  }, []);

  function calcular() {
    const v = parseNumber(valor);
    const n = parseInt(meses || "0", 10) || 0;
    if (!isFinite(v) || v <= 0 || n <= 0) return;
    const dias = Math.round(n * 30.4375);
    const anos = n / 12;
    const cdiAno = (parseNumber(cdi) || 0) / 100;
    const selicAno = (parseNumber(selic) || 0) / 100;
    const poupMes = (parseNumber(poup) || 0) / 100;

    const tributado = (nome: string, detalhe: string, taxaAno: number): Linha => {
      const bruto = v * Math.pow(1 + taxaAno, anos);
      const rend = bruto - v;
      const ir = rend > 0 ? rend * aliquotaIR(dias) : 0;
      return { nome, detalhe, bruto: round2(bruto), ir: round2(ir), liquido: round2(bruto - ir), rendimento: round2(rend - ir), isento: false };
    };
    const isento = (nome: string, detalhe: string, bruto: number): Linha => ({
      nome,
      detalhe,
      bruto: round2(bruto),
      ir: 0,
      liquido: round2(bruto),
      rendimento: round2(bruto - v),
      isento: true,
    });

    const pCdb = (parseNumber(pctCdb) || 0) / 100;
    const pLci = (parseNumber(pctLci) || 0) / 100;
    // Tesouro Selic: rende a Selic, menos a taxa de custódia da B3 (0,20% a.a.).
    const tesouro = tributado("Tesouro Selic", `Selic ${formatPercent(selicAno * 100)} − custódia 0,20% a.a.`, selicAno - 0.002);
    const lista: Linha[] = [
      tributado("CDB", `${formatNumber(pCdb * 100, 0)}% do CDI`, cdiAno * pCdb),
      isento("LCI / LCA", `${formatNumber(pLci * 100, 0)}% do CDI · isento de IR`, v * Math.pow(1 + cdiAno * pLci, anos)),
      tesouro,
      isento("Poupança", `${formatPercent(poupMes * 100, 4)} ao mês · isenta de IR`, v * Math.pow(1 + poupMes, n)),
    ];
    setLinhas(lista.sort((a, b) => b.liquido - a.liquido));
  }

  const melhor = linhas?.[0];
  const max = linhas ? Math.max(...linhas.map((l) => l.rendimento), 1) : 1;

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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor investido">
              <Input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} />
            </Field>
            <Field label="Prazo (meses)">
              <Input inputMode="numeric" value={meses} onChange={(e) => setMeses(e.target.value.replace(/\D/g, ""))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CDI (% ao ano)">
              <Input inputMode="decimal" value={cdi} onChange={(e) => setCdi(e.target.value)} />
            </Field>
            <Field label="Selic (% ao ano)">
              <Input inputMode="decimal" value={selic} onChange={(e) => setSelic(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="CDB (% CDI)">
              <Input inputMode="decimal" value={pctCdb} onChange={(e) => setPctCdb(e.target.value)} />
            </Field>
            <Field label="LCI/LCA (% CDI)">
              <Input inputMode="decimal" value={pctLci} onChange={(e) => setPctLci(e.target.value)} />
            </Field>
            <Field label="Poupança (% mês)">
              <Input inputMode="decimal" value={poup} onChange={(e) => setPoup(e.target.value)} />
            </Field>
          </div>
          <p className="text-xs text-muted">
            {taxas
              ? `Taxas preenchidas com os dados mais recentes do Banco Central. Você pode alterar.`
              : erroTaxas
                ? "Não conseguimos buscar as taxas agora; preencha com os valores atuais."
                : "Buscando taxas atualizadas…"}
          </p>
          <Button type="submit">Comparar</Button>
        </form>

        <div>
          {linhas && melhor ? (
            <ResultBox tone="financas">
              <p className="mb-1 text-sm font-medium text-muted">Melhor opção no período</p>
              <p className="text-2xl font-extrabold text-foreground">{melhor.nome}</p>
              <p className="mb-4 text-sm text-muted">
                {formatBRL(melhor.liquido)} líquidos · {formatBRL(melhor.rendimento)} de rendimento
              </p>
              <div className="space-y-3">
                {linhas.map((l) => (
                  <div key={l.nome}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-semibold">{l.nome}</span>
                      <span className="tabular-nums font-semibold">{formatBRL(l.liquido)}</span>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/60 dark:bg-black/20">
                      <div
                        className={`h-full rounded-full ${l === melhor ? "bg-emerald-500" : "bg-indigo-400"}`}
                        style={{ width: `${Math.max(2, (l.rendimento / max) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {l.detalhe} · rende {formatBRL(l.rendimento)}
                      {!l.isento && l.ir > 0 && ` (IR de ${formatBRL(l.ir)})`}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted">
                IR regressivo da renda fixa: 22,5% até 180 dias, 20% até 360, 17,5% até 720 e 15%
                acima disso. Simulação com taxas constantes; rentabilidade passada não garante
                resultado futuro. Não é recomendação de investimento.
              </p>
            </ResultBox>
          ) : (
            <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
              Informe o valor e o prazo para comparar CDB, LCI/LCA, Tesouro Selic e poupança.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
