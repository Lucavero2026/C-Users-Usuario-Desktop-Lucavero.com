"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea } from "@/components/ui";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function lista(texto: string): string {
  const itens = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!itens.length) return "";
  return `<ul>${itens.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

export default function GeradorCurriculo() {
  const [f, setF] = useState({
    nome: "",
    objetivo: "",
    email: "",
    telefone: "",
    cidade: "",
    link: "",
    resumo: "",
    experiencia: "",
    formacao: "",
    habilidades: "",
    idiomas: "",
  });

  function set(k: keyof typeof f, v: string) {
    setF((p) => ({ ...p, [k]: v }));
  }

  function gerarHTML(): string {
    const contatos = [f.email, f.telefone, f.cidade, f.link]
      .filter(Boolean)
      .map(escapeHtml)
      .join(" &nbsp;•&nbsp; ");
    const bloco = (titulo: string, conteudo: string) =>
      conteudo ? `<h2>${titulo}</h2>${conteudo}` : "";

    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Currículo — ${escapeHtml(
      f.nome,
    )}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,'Segoe UI',Arial,sans-serif;color:#1f2937;max-width:760px;margin:32px auto;padding:0 28px;line-height:1.55}
  header{border-bottom:3px solid #4f46e5;padding-bottom:12px;margin-bottom:18px}
  h1{margin:0;font-size:28px;color:#111827}
  .obj{color:#4f46e5;font-weight:600;margin-top:2px}
  .contatos{color:#6b7280;font-size:13px;margin-top:8px}
  h2{font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#4f46e5;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin:22px 0 8px}
  ul{margin:6px 0;padding-left:18px} li{margin:3px 0}
  p{margin:6px 0}
  @media print{body{margin:0}}
</style></head><body>
<header>
  <h1>${escapeHtml(f.nome || "Seu Nome")}</h1>
  ${f.objetivo ? `<div class="obj">${escapeHtml(f.objetivo)}</div>` : ""}
  ${contatos ? `<div class="contatos">${contatos}</div>` : ""}
</header>
${f.resumo ? `<h2>Resumo</h2><p>${escapeHtml(f.resumo)}</p>` : ""}
${bloco("Experiência profissional", lista(f.experiencia))}
${bloco("Formação", lista(f.formacao))}
${bloco("Habilidades", lista(f.habilidades))}
${bloco("Idiomas", lista(f.idiomas))}
<script>window.onload=function(){window.print()}</script>
</body></html>`;
  }

  function baixar() {
    if (!f.nome.trim()) {
      alert("Preencha ao menos o seu nome.");
      return;
    }
    const w = window.open("", "_blank", "width=820,height=900");
    if (!w) {
      alert("Permita pop-ups para gerar o PDF.");
      return;
    }
    w.document.write(gerarHTML());
    w.document.close();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          baixar();
        }}
        className="space-y-4"
      >
        <Field label="Nome completo">
          <Input value={f.nome} onChange={(e) => set("nome", e.target.value)} />
        </Field>
        <Field label="Cargo / objetivo" hint="Ex.: Auxiliar administrativo">
          <Input value={f.objetivo} onChange={(e) => set("objetivo", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="E-mail">
            <Input value={f.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Telefone">
            <Input value={f.telefone} onChange={(e) => set("telefone", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cidade">
            <Input value={f.cidade} onChange={(e) => set("cidade", e.target.value)} />
          </Field>
          <Field label="LinkedIn/site (opcional)">
            <Input value={f.link} onChange={(e) => set("link", e.target.value)} />
          </Field>
        </div>
        <Field label="Resumo profissional">
          <Textarea
            value={f.resumo}
            onChange={(e) => set("resumo", e.target.value)}
            className="min-h-20"
            placeholder="2-3 frases sobre você e sua experiência."
          />
        </Field>
        <Field label="Experiência" hint="Uma por linha: Cargo — Empresa (período)">
          <Textarea
            value={f.experiencia}
            onChange={(e) => set("experiencia", e.target.value)}
            className="min-h-24"
            placeholder={"Vendedor — Loja X (2022-2024): atendimento e caixa\nEstoquista — Y (2020-2022)"}
          />
        </Field>
        <Field label="Formação" hint="Uma por linha">
          <Textarea
            value={f.formacao}
            onChange={(e) => set("formacao", e.target.value)}
            className="min-h-16"
            placeholder="Ensino Médio Completo — Escola Z (2019)"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Habilidades" hint="Uma por linha">
            <Textarea
              value={f.habilidades}
              onChange={(e) => set("habilidades", e.target.value)}
              className="min-h-16"
            />
          </Field>
          <Field label="Idiomas" hint="Uma por linha">
            <Textarea
              value={f.idiomas}
              onChange={(e) => set("idiomas", e.target.value)}
              className="min-h-16"
            />
          </Field>
        </div>
        <Button type="submit">Gerar currículo em PDF</Button>
      </form>

      {/* Prévia */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="border-b-2 border-brand pb-3">
            <p className="text-xl font-bold">{f.nome || "Seu Nome"}</p>
            {f.objetivo && (
              <p className="text-sm font-semibold text-brand">{f.objetivo}</p>
            )}
            <p className="mt-1 text-xs text-muted">
              {[f.email, f.telefone, f.cidade].filter(Boolean).join(" • ")}
            </p>
          </div>
          {f.resumo && <p className="mt-3 text-sm text-muted">{f.resumo}</p>}
          {f.experiencia && (
            <>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-brand">
                Experiência
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                {f.experiencia
                  .split("\n")
                  .filter((l) => l.trim())
                  .map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
              </ul>
            </>
          )}
          <p className="mt-4 text-center text-xs text-muted">
            A prévia é resumida — o PDF sai completo e formatado.
          </p>
        </div>
      </div>
    </div>
  );
}
