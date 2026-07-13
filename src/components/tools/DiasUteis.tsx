"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import { holidaySet } from "@/lib/holidays";

export default function DiasUteis() {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [res, setRes] = useState<{
    uteis: number;
    corridos: number;
    fds: number;
    feriados: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function calcular() {
    setErro("");
    if (!inicio || !fim) return;
    const d1 = new Date(inicio + "T00:00:00");
    const d2 = new Date(fim + "T00:00:00");
    if (d2 < d1) {
      setErro("A data final deve ser igual ou posterior à inicial.");
      return;
    }
    setLoading(true);
    try {
      const years: number[] = [];
      for (let y = d1.getFullYear(); y <= d2.getFullYear(); y++) years.push(y);
      const feriados = await holidaySet(years);

      let uteis = 0;
      let corridos = 0;
      let fds = 0;
      let nferiados = 0;
      const cur = new Date(d1);
      while (cur <= d2) {
        corridos++;
        const dow = cur.getDay();
        const iso = cur.toISOString().slice(0, 10);
        const isWeekend = dow === 0 || dow === 6;
        const isHoliday = feriados.has(iso);
        if (isWeekend) fds++;
        else if (isHoliday) nferiados++;
        else uteis++;
        cur.setDate(cur.getDate() + 1);
      }
      setRes({ uteis, corridos, fds, feriados: nferiados });
    } catch {
      setErro("Não consegui carregar os feriados para o período.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          calcular();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data inicial">
            <Input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </Field>
          <Field label="Data final">
            <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </Field>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Calculando…" : "Contar dias úteis"}
        </Button>
      </form>

      {erro && <p className="text-sm text-rose-600">{erro}</p>}

      {res && (
        <ResultBox tone="utilidades">
          <p className="mb-2 text-sm font-medium text-muted">Dias úteis no período</p>
          <p className="mb-4 text-3xl font-extrabold">{res.uteis}</p>
          <Row label="Dias corridos" value={res.corridos} />
          <Row label="Fins de semana" value={res.fds} />
          <Row label="Feriados nacionais" value={res.feriados} />
          <Row label="Dias úteis" value={res.uteis} strong />
          <p className="mt-3 text-xs text-muted">
            Considera o período incluindo as duas datas. Desconta sábados, domingos
            e feriados nacionais (não inclui estaduais/municipais).
          </p>
        </ResultBox>
      )}
    </div>
  );
}
