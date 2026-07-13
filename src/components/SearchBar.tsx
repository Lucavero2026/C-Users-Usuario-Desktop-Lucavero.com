"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, CornerDownLeft, Sparkles } from "lucide-react";
import { searchServices, getCategory } from "@/lib/services";
import { ServiceIcon } from "./ServiceIcon";

const EXAMPLES = [
  "Quantos dias faltam para o Natal?",
  "Como calculo a rescisão se fui demitido?",
  "Gerar um QR Code Pix",
  "Validar um CPF",
  "Consultar um CNPJ",
];

export function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState(EXAMPLES[0]);
  const boxRef = useRef<HTMLDivElement>(null);

  // Placeholder rotativo com exemplos de intenção
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % EXAMPLES.length;
      setPlaceholder(EXAMPLES[i]);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  const results = useMemo(() => searchServices(q).slice(0, 6), [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const query = q.trim();
    if (!query) return;
    // Se houver um match local forte, vai direto pra ferramenta.
    if (results.length > 0) {
      router.push(`/ferramentas/${results[0].slug}`);
      return;
    }
    router.push(`/busca?q=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={boxRef} className="relative mx-auto w-full max-w-2xl">
      <form onSubmit={submit}>
        <div
          className={`flex items-center gap-3 rounded-full border bg-surface px-5 py-3.5 shadow-sm transition-all ${
            open ? "border-brand ring-4 ring-brand/10" : "border-border hover:shadow-md"
          }`}
        >
          <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
          <input
            /* eslint-disable-next-line jsx-a11y/no-autofocus */
            autoFocus={autoFocus}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            aria-label="Buscar um serviço ou fazer uma pergunta"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted/70"
          />
          <button
            type="submit"
            className="focus-ring hidden shrink-0 items-center gap-1 rounded-full bg-brand px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-brand-600 sm:inline-flex"
          >
            Buscar <CornerDownLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-auto py-2">
              {results.map((s) => {
                const cat = getCategory(s.category);
                return (
                  <li key={s.slug}>
                    <button
                      type="button"
                      onClick={() => router.push(`/ferramentas/${s.slug}`)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-muted"
                    >
                      <span
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: cat.colorSoft, color: cat.color }}
                      >
                        <ServiceIcon name={s.icon} className="h-4.5 w-4.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {s.name}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {s.short}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <button
              type="button"
              onClick={() => submit()}
              className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-surface-muted"
            >
              <Sparkles className="h-5 w-5 text-brand" />
              <span className="text-sm">
                Perguntar à IA:{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{q.trim()}&rdquo;
                </span>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
