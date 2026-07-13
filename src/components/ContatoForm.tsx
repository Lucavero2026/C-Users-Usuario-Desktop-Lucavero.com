"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { SITE } from "@/lib/site";

/**
 * Formulário de contato. Nesta fase, abre o cliente de e-mail do visitante
 * (mailto) — funciona sem back-end. Para receber mensagens direto no site,
 * troque por um POST para /api/contato com um provedor de e-mail (ex.: Resend).
 */
export function ContatoForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const corpo =
      `Nome: ${nome}\nE-mail: ${email}\n\n${mensagem}`.trim();
    const url = `mailto:${SITE.email}?subject=${encodeURIComponent(
      assunto || "Contato pelo site",
    )}&body=${encodeURIComponent(corpo)}`;
    window.location.href = url;
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Seu nome">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </Field>
        <Field label="Seu e-mail">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
      </div>
      <Field label="Assunto">
        <Input value={assunto} onChange={(e) => setAssunto(e.target.value)} />
      </Field>
      <Field label="Mensagem">
        <Textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          required
          placeholder="Como podemos ajudar?"
        />
      </Field>
      <Button type="submit">Enviar mensagem</Button>
      <p className="text-xs text-muted">
        Ao enviar, seu aplicativo de e-mail será aberto com a mensagem pronta para{" "}
        {SITE.email}.
      </p>
    </form>
  );
}
