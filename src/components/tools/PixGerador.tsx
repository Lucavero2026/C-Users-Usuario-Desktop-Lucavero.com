"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Button, CopyButton, Field, Input, Select } from "@/components/ui";
import { generatePixPayload } from "@/lib/br";
import { parseNumber } from "@/lib/format";

type TipoChave = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";

export default function PixGerador() {
  const [tipo, setTipo] = useState<TipoChave>("cpf");
  const [chave, setChave] = useState("");
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [payload, setPayload] = useState("");
  const [qr, setQr] = useState("");
  const [erro, setErro] = useState("");

  async function gerar() {
    setErro("");
    if (!chave.trim() || !nome.trim() || !cidade.trim()) {
      setErro("Preencha chave, nome do recebedor e cidade.");
      return;
    }
    const v = parseNumber(valor);
    const code = generatePixPayload({
      chave: chave.trim(),
      nome,
      cidade,
      valor: isFinite(v) && v > 0 ? v : undefined,
      descricao,
    });
    setPayload(code);
    try {
      const url = await QRCode.toDataURL(code, {
        width: 320,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      setQr(url);
    } catch {
      setQr("");
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          gerar();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-[130px_1fr] gap-3">
          <Field label="Tipo de chave">
            <Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoChave)}
            >
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="email">E-mail</option>
              <option value="telefone">Telefone</option>
              <option value="aleatoria">Aleatória</option>
            </Select>
          </Field>
          <Field label="Chave Pix">
            <Input
              value={chave}
              onChange={(e) => setChave(e.target.value)}
              placeholder={
                tipo === "email"
                  ? "voce@email.com"
                  : tipo === "telefone"
                    ? "+5511999999999"
                    : "Sua chave"
              }
            />
          </Field>
        </div>
        <Field label="Nome do recebedor" hint="Até 25 caracteres.">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={25} />
        </Field>
        <Field label="Cidade" hint="Até 15 caracteres.">
          <Input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            maxLength={15}
            placeholder="SAO PAULO"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor (opcional)" hint="Deixe vazio para valor livre.">
            <Input
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
            />
          </Field>
          <Field label="Descrição (opcional)">
            <Input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              maxLength={50}
            />
          </Field>
        </div>
        <Button type="submit">Gerar Pix</Button>
        {erro && <p className="text-sm text-rose-600">{erro}</p>}
      </form>

      <div>
        {payload ? (
          <div className="card space-y-4 p-5 text-center">
            {qr && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt="QR Code Pix"
                className="mx-auto rounded-xl border border-border"
                width={240}
                height={240}
              />
            )}
            <div className="text-left">
              <p className="mb-1 text-sm font-medium">Pix Copia e Cola</p>
              <p className="max-h-24 overflow-auto break-all rounded-xl bg-surface-muted p-3 font-mono text-xs">
                {payload}
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <CopyButton text={payload} label="Copiar código" />
              {qr && (
                <a
                  href={qr}
                  download="pix-qrcode.png"
                  className="focus-ring inline-flex items-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-surface-muted"
                >
                  Baixar QR
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            O QR Code e o código Copia e Cola aparecem aqui.
          </div>
        )}
      </div>
    </div>
  );
}
