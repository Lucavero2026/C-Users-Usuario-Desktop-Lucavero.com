"use client";

import { useState } from "react";
import { Button, Field, Textarea } from "@/components/ui";
import { Markdown } from "@/components/Markdown";

export default function DecodificadorJuridiques() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function explicar() {
    setErro("");
    setResultado("");
    if (texto.trim().length < 15) {
      setErro("Cole um trecho um pouco maior.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/juridiques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErro(data.error || "Não consegui processar agora.");
        return;
      }
      setResultado(data.explicacao);
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
          explicar();
        }}
        className="space-y-4"
      >
        <Field
          label="Cole o texto jurídico ou burocrático"
          hint="Notificação, multa, intimação, cláusula de contrato…"
        >
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Cole aqui o texto que você quer entender…"
            className="min-h-56"
          />
        </Field>
        <Button type="submit" disabled={loading}>
          {loading ? "Traduzindo…" : "Explicar em português claro"}
        </Button>
        {erro && <p className="text-sm text-rose-600">{erro}</p>}
      </form>

      <div>
        {loading ? (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            A IA está lendo e traduzindo o texto…
          </div>
        ) : resultado ? (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <Markdown>{resultado}</Markdown>
          </div>
        ) : (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            A explicação em linguagem simples aparecerá aqui.
          </div>
        )}
      </div>
    </div>
  );
}
