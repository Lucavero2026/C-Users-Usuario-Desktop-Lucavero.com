"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button, CopyButton, Field, Input, Select } from "@/components/ui";
import {
  formatCNPJ,
  formatCPF,
  formatPIS,
  generateCNPJ,
  generateCPF,
  generatePIS,
  isValidCNPJ,
  isValidCPF,
  isValidPIS,
} from "@/lib/br";

type Doc = "cpf" | "cnpj" | "pis";

const GEN: Record<Doc, () => string> = {
  cpf: generateCPF,
  cnpj: generateCNPJ,
  pis: generatePIS,
};
const FMT: Record<Doc, (v: string) => string> = {
  cpf: formatCPF,
  cnpj: formatCNPJ,
  pis: formatPIS,
};
const VAL: Record<Doc, (v: string) => boolean> = {
  cpf: isValidCPF,
  cnpj: isValidCNPJ,
  pis: isValidPIS,
};

export default function GeradorDocumentos() {
  const [tipo, setTipo] = useState<Doc>("cpf");
  const [formatar, setFormatar] = useState(true);
  const [gerado, setGerado] = useState("");

  const [checar, setChecar] = useState("");
  const [resultado, setResultado] = useState<boolean | null>(null);

  function gerar() {
    const raw = GEN[tipo]();
    setGerado(formatar ? FMT[tipo](raw) : raw);
  }

  function validar() {
    if (!checar.trim()) {
      setResultado(null);
      return;
    }
    setResultado(VAL[tipo](checar));
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gerador */}
      <div className="card space-y-4 p-5">
        <h2 className="font-semibold">Gerar documento</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo">
            <Select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value as Doc);
                setGerado("");
                setResultado(null);
              }}
            >
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="pis">PIS/PASEP</option>
            </Select>
          </Field>
          <Field label="Formato">
            <Select
              value={formatar ? "1" : "0"}
              onChange={(e) => setFormatar(e.target.value === "1")}
            >
              <option value="1">Com pontuação</option>
              <option value="0">Só números</option>
            </Select>
          </Field>
        </div>
        <Button type="button" onClick={gerar} className="w-full">
          Gerar {tipo.toUpperCase()}
        </Button>
        {gerado && (
          <div className="flex items-center gap-2">
            <p className="flex-1 rounded-xl bg-surface-muted p-3 text-center font-mono text-lg font-semibold tracking-wider">
              {gerado}
            </p>
            <CopyButton text={gerado} />
          </div>
        )}
        <p className="text-xs text-muted">
          Números matematicamente válidos, gerados aleatoriamente para testar
          sistemas. Não pertencem a nenhuma pessoa ou empresa real.
        </p>
      </div>

      {/* Validador */}
      <div className="card space-y-4 p-5">
        <h2 className="font-semibold">Validar documento</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            validar();
          }}
          className="space-y-3"
        >
          <Field label={`Digite um ${tipo.toUpperCase()}`}>
            <Input
              value={checar}
              onChange={(e) => {
                setChecar(e.target.value);
                setResultado(null);
              }}
              placeholder="Cole o número aqui"
            />
          </Field>
          <Button type="submit" variant="outline" className="w-full">
            Validar
          </Button>
        </form>
        {resultado !== null && (
          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium ${
              resultado
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            {resultado ? (
              <>
                <CheckCircle2 className="h-5 w-5" /> {tipo.toUpperCase()} válido
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" /> {tipo.toUpperCase()} inválido
              </>
            )}
          </div>
        )}
        <p className="text-xs text-muted">
          A validação confere apenas os dígitos verificadores — não consulta se o
          documento existe ou está ativo.
        </p>
      </div>
    </div>
  );
}
