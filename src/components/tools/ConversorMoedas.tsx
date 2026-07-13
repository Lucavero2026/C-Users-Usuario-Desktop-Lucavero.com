"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button, Field, Input, ResultBox, Select } from "@/components/ui";
import { formatNumber, parseNumber } from "@/lib/format";

const MOEDAS = [
  { code: "BRL", label: "Real (BRL)" },
  { code: "USD", label: "Dólar americano (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "Libra (GBP)" },
  { code: "ARS", label: "Peso argentino (ARS)" },
  { code: "JPY", label: "Iene (JPY)" },
  { code: "CAD", label: "Dólar canadense (CAD)" },
  { code: "BTC", label: "Bitcoin (BTC)" },
];

export default function ConversorMoedas() {
  const [valor, setValor] = useState("1");
  const [de, setDe] = useState("USD");
  const [para, setPara] = useState("BRL");
  const [res, setRes] = useState<{
    convertido: number;
    taxa: number;
    atualizado: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function converter() {
    setErro("");
    const v = parseNumber(valor);
    if (!isFinite(v)) return;
    if (de === para) {
      setRes({ convertido: v, taxa: 1, atualizado: "" });
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(
        `https://economia.awesomeapi.com.br/last/${de}-${para}`,
      );
      if (!r.ok) throw new Error("cotação indisponível");
      const data = await r.json();
      const key = `${de}${para}`;
      const cot = data[key];
      if (!cot) throw new Error("par não encontrado");
      const taxa = parseFloat(cot.bid);
      setRes({
        convertido: v * taxa,
        taxa,
        atualizado: cot.create_date || "",
      });
    } catch {
      setErro("Não consegui buscar a cotação agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function inverter() {
    setDe(para);
    setPara(de);
    setRes(null);
  }

  return (
    <div className="max-w-xl space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          converter();
        }}
        className="space-y-4"
      >
        <Field label="Valor">
          <Input
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </Field>
        <div className="flex items-end gap-2">
          <Field label="De">
            <Select value={de} onChange={(e) => setDe(e.target.value)}>
              {MOEDAS.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            type="button"
            variant="outline"
            onClick={inverter}
            className="mb-0.5 !px-3"
            aria-label="Inverter moedas"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <Field label="Para">
            <Select value={para} onChange={(e) => setPara(e.target.value)}>
              {MOEDAS.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Buscando cotação…" : "Converter"}
        </Button>
      </form>

      {erro && <p className="text-sm text-rose-600">{erro}</p>}

      {res && (
        <ResultBox tone="financas">
          <p className="text-sm font-medium text-muted">
            {formatNumber(parseNumber(valor))} {de} equivale a
          </p>
          <p className="my-1 text-3xl font-extrabold">
            {formatNumber(res.convertido, para === "BTC" ? 8 : 2)} {para}
          </p>
          {res.taxa !== 1 && (
            <p className="text-sm text-muted">
              1 {de} = {formatNumber(res.taxa, 4)} {para}
              {res.atualizado && ` · atualizado em ${res.atualizado}`}
            </p>
          )}
        </ResultBox>
      )}
      <p className="text-xs text-muted">
        Cotações comerciais de referência (AwesomeAPI). Podem diferir da taxa
        praticada por bancos e casas de câmbio.
      </p>
    </div>
  );
}
