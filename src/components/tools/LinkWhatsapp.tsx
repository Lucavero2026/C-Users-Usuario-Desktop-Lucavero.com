"use client";

import { useState } from "react";
import { CopyButton, Field, Input, Textarea } from "@/components/ui";
import { onlyDigits } from "@/lib/format";

export default function LinkWhatsapp() {
  const [ddi, setDdi] = useState("55");
  const [numero, setNumero] = useState("");
  const [msg, setMsg] = useState("");

  const digits = onlyDigits(ddi) + onlyDigits(numero);
  const valido = onlyDigits(numero).length >= 10;
  const link = valido
    ? `https://wa.me/${digits}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`
    : "";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="grid grid-cols-[90px_1fr] gap-3">
          <Field label="DDI">
            <Input
              inputMode="numeric"
              value={ddi}
              onChange={(e) => setDdi(onlyDigits(e.target.value).slice(0, 3))}
            />
          </Field>
          <Field label="Número com DDD" hint="Ex.: 11 91234-5678">
            <Input
              inputMode="numeric"
              placeholder="11912345678"
              value={numero}
              onChange={(e) => setNumero(onlyDigits(e.target.value).slice(0, 11))}
            />
          </Field>
        </div>
        <Field label="Mensagem inicial (opcional)">
          <Textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Olá! Vi seu contato e gostaria de…"
          />
        </Field>
      </div>

      <div>
        {valido ? (
          <div className="card space-y-4 p-5">
            <div>
              <p className="mb-1 text-sm font-medium">Seu link</p>
              <p className="break-all rounded-xl bg-surface-muted p-3 font-mono text-sm">
                {link}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={link} label="Copiar link" />
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex items-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
              >
                Abrir no WhatsApp
              </a>
            </div>
            <p className="text-xs text-muted">
              Compartilhe esse link em bio, e-mail ou anúncio: ao clicar, a pessoa
              abre uma conversa direto com você.
            </p>
          </div>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Digite o número com DDD para gerar o link.
          </div>
        )}
      </div>
    </div>
  );
}
