"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import { onlyDigits } from "@/lib/format";

interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ddd?: string;
  erro?: boolean;
}

export default function ConsultaCep() {
  const [cep, setCep] = useState("");
  const [data, setData] = useState<CepData | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function buscar() {
    setErro("");
    setData(null);
    const d = onlyDigits(cep);
    if (d.length !== 8) {
      setErro("Digite um CEP com 8 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = (await r.json()) as CepData;
      if (j.erro) {
        setErro("CEP não encontrado.");
      } else {
        setData(j);
      }
    } catch {
      setErro("Não consegui consultar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          buscar();
        }}
        className="flex items-end gap-2"
      >
        <Field label="CEP">
          <Input
            inputMode="numeric"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => {
              const v = onlyDigits(e.target.value).slice(0, 8);
              setCep(v.replace(/(\d{5})(\d)/, "$1-$2"));
            }}
          />
        </Field>
        <Button type="submit" disabled={loading} className="mb-0.5">
          {loading ? "Buscando…" : "Consultar"}
        </Button>
      </form>

      {erro && <p className="text-sm text-rose-600">{erro}</p>}

      {data && (
        <ResultBox tone="consultas">
          <p className="mb-3 text-lg font-bold">
            {data.logradouro || "—"}
            {data.complemento ? `, ${data.complemento}` : ""}
          </p>
          <Row label="Bairro" value={data.bairro || "—"} />
          <Row label="Cidade" value={`${data.localidade} / ${data.uf}`} />
          <Row label="CEP" value={data.cep} />
          {data.ddd && <Row label="DDD" value={data.ddd} />}
        </ResultBox>
      )}
      <p className="text-xs text-muted">Dados dos Correios via ViaCEP.</p>
    </div>
  );
}
