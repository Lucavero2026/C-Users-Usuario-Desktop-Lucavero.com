"use client";

import { useEffect, useState } from "react";
import { Field, Select } from "@/components/ui";
import { fetchHolidays, type Holiday } from "@/lib/holidays";

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: 7 }, (_, i) => ANO_ATUAL - 1 + i);
const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export default function Feriados() {
  const [ano, setAno] = useState(String(ANO_ATUAL));
  const [lista, setLista] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setLoading(true);
    setErro("");
    fetchHolidays(parseInt(ano, 10))
      .then((h) =>
        setLista([...h].sort((a, b) => a.date.localeCompare(b.date))),
      )
      .catch(() => setErro("Não consegui carregar os feriados agora."))
      .finally(() => setLoading(false));
  }, [ano]);

  return (
    <div className="max-w-xl space-y-4">
      <Field label="Ano">
        <Select value={ano} onChange={(e) => setAno(e.target.value)}>
          {ANOS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </Field>

      {loading && <p className="text-sm text-muted">Carregando feriados…</p>}
      {erro && <p className="text-sm text-rose-600">{erro}</p>}

      {!loading && !erro && (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {lista.map((h) => {
            const d = new Date(h.date + "T00:00:00");
            return (
              <li
                key={h.date}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{h.name}</p>
                  <p className="text-xs capitalize text-muted">
                    {DIAS[d.getDay()]}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-surface-muted px-3 py-1 text-sm font-semibold tabular-nums">
                  {d.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-muted">
        Feriados nacionais via BrasilAPI. Não inclui feriados estaduais e
        municipais.
      </p>
    </div>
  );
}
