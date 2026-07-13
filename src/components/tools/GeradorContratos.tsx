"use client";

import { useState } from "react";
import { marked } from "marked";
import { Button, CopyButton, Field, Input, Select, Textarea } from "@/components/ui";
import { Markdown } from "@/components/Markdown";

const TIPOS = [
  { v: "servicos", l: "Prestação de serviços" },
  { v: "aluguel", l: "Locação (aluguel)" },
  { v: "aluguel-vaga", l: "Aluguel de vaga de garagem" },
  { v: "venda-bem", l: "Compra e venda de bem (veículo, celular…)" },
  { v: "emprestimo", l: "Empréstimo de dinheiro entre pessoas" },
  { v: "recibo", l: "Recibo de pagamento / quitação" },
  { v: "confidencialidade", l: "Termo de confidencialidade (NDA)" },
];

export default function GeradorContratos() {
  const [form, setForm] = useState({
    tipo: "servicos",
    parte1: "",
    doc1: "",
    parte2: "",
    doc2: "",
    objeto: "",
    valor: "",
    pagamento: "",
    prazo: "",
    cidade: "",
    extra: "",
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
    if (!form.parte1.trim() || !form.objeto.trim()) {
      setErro("Preencha ao menos a primeira parte e o objeto do contrato.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/contratos", {
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
    const page = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Contrato</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;max-width:760px;margin:40px auto;padding:0 24px;line-height:1.7}
  h1,h2{font-family:Georgia,serif} h2{margin-top:1.6em;font-size:1.15rem}
  em{color:#555} hr{border:none;border-top:1px solid #ccc;margin:2em 0}
  @media print{body{margin:0}}
</style></head><body>${html}
<script>window.onload=function(){window.print()}</script></body></html>`;
    const w = window.open("", "_blank", "width=820,height=900");
    if (!w) {
      alert("Permita pop-ups para gerar o PDF.");
      return;
    }
    w.document.write(page);
    w.document.close();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
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
          <Field label="Parte 1 (nome)">
            <Input value={form.parte1} onChange={(e) => set("parte1", e.target.value)} />
          </Field>
          <Field label="CPF/CNPJ da parte 1">
            <Input value={form.doc1} onChange={(e) => set("doc1", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Parte 2 (nome)">
            <Input value={form.parte2} onChange={(e) => set("parte2", e.target.value)} />
          </Field>
          <Field label="CPF/CNPJ da parte 2">
            <Input value={form.doc2} onChange={(e) => set("doc2", e.target.value)} />
          </Field>
        </div>
        <Field label="Objeto / descrição" hint="O que está sendo contratado, vendido ou alugado.">
          <Textarea
            value={form.objeto}
            onChange={(e) => set("objeto", e.target.value)}
            className="min-h-20"
            placeholder="Ex.: aluguel de 1 vaga de garagem no Edifício X, nº 12"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor">
            <Input value={form.valor} onChange={(e) => set("valor", e.target.value)} placeholder="Ex.: R$ 250,00/mês" />
          </Field>
          <Field label="Forma de pagamento">
            <Input value={form.pagamento} onChange={(e) => set("pagamento", e.target.value)} placeholder="Ex.: Pix todo dia 5" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prazo / vigência">
            <Input value={form.prazo} onChange={(e) => set("prazo", e.target.value)} placeholder="Ex.: 12 meses" />
          </Field>
          <Field label="Cidade (foro)">
            <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
          </Field>
        </div>
        <Field label="Condições adicionais (opcional)">
          <Textarea
            value={form.extra}
            onChange={(e) => set("extra", e.target.value)}
            className="min-h-16"
            placeholder="Qualquer cláusula ou detalhe extra que queira incluir."
          />
        </Field>
        <Button type="submit" disabled={loading}>
          {loading ? "Gerando contrato…" : "Gerar contrato com IA"}
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
            Preencha os dados e clique em gerar. O contrato pronto aparecerá aqui,
            com opção de baixar em PDF.
          </div>
        )}
      </div>
    </div>
  );
}
