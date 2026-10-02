"use client";

import { useState } from "react";
import { Input } from "@/components/ui";
import { parseNumber } from "@/lib/format";

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: Math.abs(n) < 1 && n !== 0 ? 4 : 2,
  }).format(n);
}

function Bloco({
  titulo,
  children,
  resultado,
}: {
  titulo: string;
  children: React.ReactNode;
  resultado: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-3 font-bold">{titulo}</h3>
      <div className="flex flex-wrap items-center gap-2 text-sm">{children}</div>
      <p className="mt-3 rounded-xl bg-[var(--c-financas-soft)] px-4 py-3 text-lg font-bold tabular-nums">
        {resultado}
      </p>
    </div>
  );
}

const box = "w-28 text-center";

export default function Porcentagem() {
  const [a1, setA1] = useState("15");
  const [b1, setB1] = useState("200");
  const [a2, setA2] = useState("30");
  const [b2, setB2] = useState("120");
  const [a3, setA3] = useState("100");
  const [b3, setB3] = useState("10");
  const [a4, setA4] = useState("80");
  const [b4, setB4] = useState("100");

  const r1 = (parseNumber(a1) / 100) * parseNumber(b1);
  const r2 = (parseNumber(a2) / parseNumber(b2)) * 100;
  const v3 = parseNumber(a3);
  const p3 = parseNumber(b3) / 100;
  const r4 = ((parseNumber(b4) - parseNumber(a4)) / parseNumber(a4)) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Bloco titulo="Quanto é X% de um valor?" resultado={`= ${fmt(r1)}`}>
        <Input className={box} inputMode="decimal" value={a1} onChange={(e) => setA1(e.target.value)} />
        <span>% de</span>
        <Input className={box} inputMode="decimal" value={b1} onChange={(e) => setB1(e.target.value)} />
      </Bloco>

      <Bloco titulo="X é quantos % de Y?" resultado={`= ${fmt(r2)}%`}>
        <Input className={box} inputMode="decimal" value={a2} onChange={(e) => setA2(e.target.value)} />
        <span>é quantos % de</span>
        <Input className={box} inputMode="decimal" value={b2} onChange={(e) => setB2(e.target.value)} />
      </Bloco>

      <Bloco
        titulo="Aumento ou desconto de X%"
        resultado={
          <>
            <span className="text-emerald-700 dark:text-emerald-400">+ aumento: {fmt(v3 * (1 + p3))}</span>
            <br />
            <span className="text-rose-600">− desconto: {fmt(v3 * (1 - p3))}</span>
          </>
        }
      >
        <Input className={box} inputMode="decimal" value={a3} onChange={(e) => setA3(e.target.value)} />
        <span>com</span>
        <Input className={box} inputMode="decimal" value={b3} onChange={(e) => setB3(e.target.value)} />
        <span>%</span>
      </Bloco>

      <Bloco
        titulo="Variação percentual (de A para B)"
        resultado={isFinite(r4) ? `${r4 >= 0 ? "aumento de" : "queda de"} ${fmt(Math.abs(r4))}%` : "—"}
      >
        <span>de</span>
        <Input className={box} inputMode="decimal" value={a4} onChange={(e) => setA4(e.target.value)} />
        <span>para</span>
        <Input className={box} inputMode="decimal" value={b4} onChange={(e) => setB4(e.target.value)} />
      </Bloco>
    </div>
  );
}
