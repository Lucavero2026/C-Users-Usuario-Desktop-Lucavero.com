"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";

function formatarPlaca(v: string): string {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
}

/** Quadro de destaque do carro-chefe: diagnóstico de veículo por placa. */
export function VeiculoSpotlight() {
  const router = useRouter();
  const [placa, setPlaca] = useState("");

  function ir(e: React.FormEvent) {
    e.preventDefault();
    const p = formatarPlaca(placa);
    router.push(
      p.length >= 7
        ? `/ferramentas/diagnostico-veiculo?placa=${p}`
        : "/ferramentas/diagnostico-veiculo",
    );
  }

  return (
    <section className="container-page pt-2 pb-4">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-indigo-600 via-sky-600 to-emerald-600 p-6 shadow-lg sm:p-9">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Carro-chefe do Lucavero
            </span>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
              Vai comprar um carro usado?
              <br className="hidden sm:block" /> Evite dor de cabeça.
            </h2>
            <p className="mt-2 max-w-lg text-sm text-white/90 sm:text-base">
              Faça uma consulta completa sobre a procedência do veículo pela placa:
              roubo/furto, sinistro, leilão, débitos e valor de avaliação.
            </p>
          </div>

          <form
            onSubmit={ir}
            className="rounded-2xl bg-white/95 p-4 shadow-md backdrop-blur"
          >
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Digite a placa do veículo
            </label>
            <div className="flex gap-2">
              <input
                value={placa}
                onChange={(e) => setPlaca(formatarPlaca(e.target.value))}
                placeholder="ABC1D23"
                aria-label="Placa do veículo"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-center text-lg font-bold uppercase tracking-[0.25em] text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              />
              <button
                type="submit"
                className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Search className="h-4 w-4" /> Consultar
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              Consulta a partir de R$ 0,62 · relatório completo R$ 59,00
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
