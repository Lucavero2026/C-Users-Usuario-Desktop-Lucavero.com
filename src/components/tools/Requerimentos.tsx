"use client";

import { useState } from "react";
import { marked } from "marked";
import { Button, CopyButton, Field, Input, Select, Textarea } from "@/components/ui";
import { Markdown } from "@/components/Markdown";

const TIPOS = [
  { v: "multa-transito", l: "Recurso de multa de trânsito" },
  { v: "cobranca-indevida", l: "Contestar cobrança indevida" },
  { v: "reembolso", l: "Pedir reembolso / estorno" },
  { v: "reclamacao", l: "Reclamação formal (Procon)" },
  { v: "requerimento", l: "Requerimento administrativo" },
];

export default function Requerimentos() {
  const [form, setForm] = useState({
    tipo: "cobranca-indevida",
    nome: "",
    doc: "",
    destinatario: "",
    cidade: "",
    situacao: "",
  });
  const [doc, setDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function gerar() {
    setErro("");
    setDoc("");
    if (form.situacao.trim().length < 15) {
      setErro("Descreva a situação com um pouco mais de detalhe.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/requerimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) {
        setErro(data.error || "Não consegui gerar agora.");
        return;
      }
      setDoc(data.documento);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function imprimir() {
    if (!doc) return;
    const html = marked.parse(doc) as string;
    const page = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Documento</title>
<style>body{font-family:Georgia,serif;color:#1a1a1a;max-width:760px;margin:40px auto;padding:0 24px;line-height:1.7}h2{margin-top:1.6em;font-size:1.1rem}em{color:#555}@media print{body{margin:0}}</style>
</head><body>${html}<script>window.onload=function(){window.print()}</script></body></html>`;
    const w = window.open("", "_blank", "width=820,height=900");
    if (!w) {
      alert("Permita pop-ups para gerar o PDF.");
      return;
    }
    w.document.write(page);
    w.document.close();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_1fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          gerar();
        }}
        className="space-y-4"
      >
        <Field label="Tipo de documento">
          <Select value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
            {TIPOS.map((t) => (
              <option key={t.v} value={t.v}>
                {t.l}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Seu nome">
            <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} />
          </Field>
          <Field label="Seu CPF">
            <Input value={form.doc} onChange={(e) => set("doc", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Destinatário / órgão">
            <Input
              value={form.destinatario}
              onChange={(e) => set("destinatario", e.target.value)}
              placeholder="Ex.: Operadora X, DETRAN…"
            />
          </Field>
          <Field label="Cidade">
            <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
          </Field>
        </div>
        <Field label="Descreva a situação" hint="O que aconteceu, datas, valores, o que você quer.">
          <Textarea
            value={form.situacao}
            onChange={(e) => set("situacao", e.target.value)}
            className="min-h-40"
            placeholder="Ex.: Fui cobrado por um serviço que cancelei em..."
          />
        </Field>
        <Button type="submit" disabled={loading}>
          {loading ? "Gerando documento…" : "Gerar documento com IA"}
        </Button>
        {erro && <p className="text-sm text-rose-600">{erro}</p>}
      </form>

      <div>
        {loading ? (
          <div className="flex h-full min-h-72 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            A IA está redigindo o documento…
          </div>
        ) : doc ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={imprimir}>
                Baixar / imprimir PDF
              </Button>
              <CopyButton text={doc} label="Copiar texto" />
            </div>
            <div className="max-h-[36rem] overflow-auto rounded-2xl border border-border bg-surface p-6">
              <Markdown>{doc}</Markdown>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-72 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Preencha os dados e clique em gerar. O documento pronto aparecerá aqui.
          </div>
        )}
      </div>
    </div>
  );
}
