"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, Input } from "@/components/ui";
import { normalize } from "@/lib/services";

interface Bank {
  ispb: string;
  name: string | null;
  code: number | null;
  fullName: string | null;
}

export default function ConsultaBancos() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("https://brasilapi.com.br/api/banks/v1");
        if (!r.ok) throw new Error();
        setBanks((await r.json()) as Bank[]);
      } catch {
        setErro("Não consegui carregar a lista de bancos agora.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const results = useMemo(() => {
    const term = normalize(q);
    const list = banks.filter((b) => b.code != null);
    if (!term) return list.sort((a, b) => (a.code || 0) - (b.code || 0));
    return list
      .filter(
        (b) =>
          String(b.code).padStart(3, "0").includes(term) ||
          normalize(b.name || "").includes(term) ||
          normalize(b.fullName || "").includes(term),
      )
      .sort((a, b) => (a.code || 0) - (b.code || 0));
  }, [banks, q]);

  return (
    <div className="max-w-2xl space-y-4">
      <Field label="Buscar banco" hint="Por código (ex.: 341) ou nome (ex.: Itaú).">
        <Input
          placeholder="Código ou nome do banco"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Field>

      {loading && <p className="text-sm text-muted">Carregando bancos…</p>}
      {erro && <p className="text-sm text-rose-600">{erro}</p>}

      {!loading && !erro && (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="max-h-[26rem] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-muted text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Código</th>
                  <th className="px-4 py-2.5 font-semibold">Banco</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 200).map((b) => (
                  <tr key={b.ispb} className="border-t border-border">
                    <td className="px-4 py-2.5 font-mono font-semibold tabular-nums">
                      {String(b.code).padStart(3, "0")}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-medium">{b.name}</span>
                      {b.fullName && b.fullName !== b.name && (
                        <span className="block text-xs text-muted">
                          {b.fullName}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-muted">
                      Nenhum banco encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-xs text-muted">Códigos de compensação (COMPE) via BrasilAPI.</p>
    </div>
  );
}
