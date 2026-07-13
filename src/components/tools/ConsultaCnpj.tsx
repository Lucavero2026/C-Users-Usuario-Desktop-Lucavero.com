"use client";

import { useState } from "react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";
import { formatCNPJ, isValidCNPJ } from "@/lib/br";
import { onlyDigits } from "@/lib/format";

interface CnpjData {
  razao_social: string;
  nome_fantasia?: string;
  descricao_situacao_cadastral?: string;
  data_inicio_atividade?: string;
  cnae_fiscal_descricao?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  ddd_telefone_1?: string;
}

export default function ConsultaCnpj() {
  const [cnpj, setCnpj] = useState("");
  const [data, setData] = useState<CnpjData | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function buscar() {
    setErro("");
    setData(null);
    const d = onlyDigits(cnpj);
    if (!isValidCNPJ(d)) {
      setErro("CNPJ inválido. Confira os 14 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`);
      if (r.status === 404) {
        setErro("CNPJ não encontrado na base pública.");
        return;
      }
      if (!r.ok) throw new Error();
      setData((await r.json()) as CnpjData);
    } catch {
      setErro("Não consegui consultar agora. Tente novamente em instantes.");
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
        <Field label="CNPJ">
          <Input
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={(e) => {
              const v = onlyDigits(e.target.value).slice(0, 14);
              setCnpj(v.length === 14 ? formatCNPJ(v) : v);
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
          <p className="text-lg font-bold">{data.razao_social}</p>
          {data.nome_fantasia && (
            <p className="mb-3 text-sm text-muted">{data.nome_fantasia}</p>
          )}
          {data.descricao_situacao_cadastral && (
            <Row label="Situação" value={data.descricao_situacao_cadastral} />
          )}
          {data.data_inicio_atividade && (
            <Row
              label="Abertura"
              value={new Date(data.data_inicio_atividade).toLocaleDateString(
                "pt-BR",
              )}
            />
          )}
          {data.cnae_fiscal_descricao && (
            <Row label="Atividade" value={data.cnae_fiscal_descricao} />
          )}
          {(data.logradouro || data.municipio) && (
            <Row
              label="Endereço"
              value={
                `${data.logradouro || ""}${data.numero ? ", " + data.numero : ""}` +
                `${data.bairro ? " - " + data.bairro : ""}` +
                `${data.municipio ? " - " + data.municipio : ""}` +
                `${data.uf ? "/" + data.uf : ""}`
              }
            />
          )}
          {data.ddd_telefone_1 && (
            <Row label="Telefone" value={data.ddd_telefone_1} />
          )}
        </ResultBox>
      )}
      <p className="text-xs text-muted">Dados públicos da Receita Federal via BrasilAPI.</p>
    </div>
  );
}
