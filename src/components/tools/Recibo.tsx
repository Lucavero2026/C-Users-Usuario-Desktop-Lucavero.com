"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { formatBRL, parseNumber } from "@/lib/format";
import { valorPorExtenso } from "@/lib/extenso";

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Recibo() {
  const [numero, setNumero] = useState("001");
  const [valor, setValor] = useState("");
  const [recebedor, setRecebedor] = useState("");
  const [docRecebedor, setDocRecebedor] = useState("");
  const [pagador, setPagador] = useState("");
  const [docPagador, setDocPagador] = useState("");
  const [referente, setReferente] = useState("");
  const [cidade, setCidade] = useState("");
  const [data, setData] = useState(hoje());

  function imprimir() {
    const v = parseNumber(valor);
    if (!isFinite(v) || v <= 0 || !recebedor || !pagador) {
      alert("Preencha ao menos valor, quem recebe e quem paga.");
      return;
    }
    const extenso = valorPorExtenso(v);
    const dataFmt = new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Recibo ${numero}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;margin:0;padding:48px;background:#fff}
  .recibo{max-width:720px;margin:0 auto;border:2px solid #1a1a1a;border-radius:12px;padding:40px}
  .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;border-bottom:1px solid #ccc;padding-bottom:16px}
  h1{font-size:28px;letter-spacing:4px;margin:0}
  .valor{font-size:22px;font-weight:bold;border:2px solid #1a1a1a;border-radius:8px;padding:8px 16px}
  p{line-height:1.7;font-size:16px;margin:14px 0}
  .assinatura{margin-top:64px;text-align:center}
  .linha{border-top:1px solid #1a1a1a;width:320px;margin:0 auto 6px}
  .rodape{margin-top:32px;font-size:12px;color:#666;text-align:center}
  @media print{body{padding:0}.recibo{border:none}}
</style></head><body>
<div class="recibo">
  <div class="top">
    <div><h1>RECIBO</h1><div style="font-size:13px;color:#666">Nº ${escapeHtml(numero)}</div></div>
    <div class="valor">${formatBRL(v)}</div>
  </div>
  <p>Recebi de <strong>${escapeHtml(pagador)}</strong>${
    docPagador ? ` (${escapeHtml(docPagador)})` : ""
  } a importância de <strong>${escapeHtml(extenso)}</strong>${
    referente ? `, referente a <strong>${escapeHtml(referente)}</strong>` : ""
  }.</p>
  <p>Para maior clareza, firmo o presente recibo, dando plena e total quitação.</p>
  <p style="margin-top:36px">${escapeHtml(cidade || "")}${
    cidade ? ", " : ""
  }${dataFmt}.</p>
  <div class="assinatura">
    <div class="linha"></div>
    <div><strong>${escapeHtml(recebedor)}</strong></div>
    ${docRecebedor ? `<div style="font-size:13px;color:#666">${escapeHtml(docRecebedor)}</div>` : ""}
  </div>
  <div class="rodape">Recibo gerado em lucavero.com</div>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) {
      alert("Permita pop-ups para gerar o PDF do recibo.");
      return;
    }
    w.document.write(html);
    w.document.close();
  }

  const v = parseNumber(valor);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nº do recibo">
            <Input value={numero} onChange={(e) => setNumero(e.target.value)} />
          </Field>
          <Field label="Valor">
            <Input
              inputMode="decimal"
              placeholder="Ex.: 500,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Quem recebe (recebedor)">
          <Input value={recebedor} onChange={(e) => setRecebedor(e.target.value)} />
        </Field>
        <Field label="CPF/CNPJ do recebedor (opcional)">
          <Input
            value={docRecebedor}
            onChange={(e) => setDocRecebedor(e.target.value)}
          />
        </Field>
        <Field label="Quem paga (pagador)">
          <Input value={pagador} onChange={(e) => setPagador(e.target.value)} />
        </Field>
        <Field label="CPF/CNPJ do pagador (opcional)">
          <Input
            value={docPagador}
            onChange={(e) => setDocPagador(e.target.value)}
          />
        </Field>
        <Field label="Referente a">
          <Textarea
            value={referente}
            onChange={(e) => setReferente(e.target.value)}
            placeholder="Ex.: serviço de pintura da sala"
            className="min-h-20"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cidade">
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </Field>
          <Field label="Data">
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </Field>
        </div>
        <Button type="button" onClick={imprimir}>
          Gerar recibo em PDF
        </Button>
      </div>

      {/* Prévia */}
      <div className="card p-6">
        <div className="mb-4 flex items-start justify-between border-b border-border pb-3">
          <div>
            <p className="text-xl font-bold tracking-widest">RECIBO</p>
            <p className="text-xs text-muted">Nº {numero || "—"}</p>
          </div>
          <span className="rounded-lg border-2 border-foreground px-3 py-1 font-bold">
            {isFinite(v) && v > 0 ? formatBRL(v) : "R$ 0,00"}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          Recebi de <strong>{pagador || "___"}</strong>
          {docPagador ? ` (${docPagador})` : ""} a importância de{" "}
          <strong>
            {isFinite(v) && v > 0 ? valorPorExtenso(v) : "___"}
          </strong>
          {referente ? (
            <>
              , referente a <strong>{referente}</strong>
            </>
          ) : null}
          .
        </p>
        <div className="mt-12 text-center">
          <div className="mx-auto mb-1 w-56 border-t border-foreground" />
          <p className="text-sm font-semibold">{recebedor || "Recebedor"}</p>
          {docRecebedor && <p className="text-xs text-muted">{docRecebedor}</p>}
        </div>
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
