"use client";

import { useState } from "react";
import { Button, Field, Textarea } from "@/components/ui";
import { Markdown } from "@/components/Markdown";

const EXEMPLOS = [
  "Fui demitido sem justa causa. O que tenho a receber?",
  "Comprei um produto com defeito e a loja não quer trocar.",
  "Meu voo atrasou 5 horas. Tenho direito a alguma coisa?",
  "O plano de saúde negou um exame. Isso é permitido?",
];

export default function ConsulteDireitos() {
  const [duvida, setDuvida] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function perguntar(texto?: string) {
    const q = (texto ?? duvida).trim();
    setErro("");
    setResposta("");
    if (q.length < 10) {
      setErro("Descreva sua dúvida com um pouco mais de detalhe.");
      return;
    }
    if (texto) setDuvida(texto);
    setLoading(true);
    try {
      const r = await fetch("/api/direitos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duvida: q }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErro(data.error || "Não consegui responder agora.");
        return;
      }
      setResposta(data.resposta);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          perguntar();
        }}
        className="space-y-4"
      >
        <Field label="Descreva sua situação ou dúvida">
          <Textarea
            value={duvida}
            onChange={(e) => setDuvida(e.target.value)}
            placeholder="Conte o que aconteceu e qual é a sua dúvida…"
            className="min-h-40"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          {EXEMPLOS.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => perguntar(ex)}
              className="focus-ring rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:border-brand hover:text-brand"
            >
              {ex}
            </button>
          ))}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Consultando…" : "Consultar meus direitos"}
        </Button>
        {erro && <p className="text-sm text-rose-600">{erro}</p>}
      </form>

      <div>
        {loading ? (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Analisando sua situação…
          </div>
        ) : resposta ? (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <Markdown>{resposta}</Markdown>
          </div>
        ) : (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            A orientação sobre seus direitos aparecerá aqui.
          </div>
        )}
      </div>
    </div>
  );
}
