"use client";

import { useEffect, useState } from "react";
import { Field, ResultBox, Row, Select } from "@/components/ui";

interface Item {
  codigo: string;
  nome: string;
}
interface Valor {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  MesReferencia: string;
  CodigoFipe: string;
}

const TIPOS = [
  { v: "carros", l: "Carros" },
  { v: "motos", l: "Motos" },
  { v: "caminhoes", l: "Caminhões" },
];

async function fetchFipe<T>(path: string): Promise<T> {
  const r = await fetch(`/api/fipe?path=${encodeURIComponent(path)}`);
  if (!r.ok) throw new Error("fipe");
  return r.json();
}

export default function ConsultaFipe() {
  const [tipo, setTipo] = useState("carros");
  const [marcas, setMarcas] = useState<Item[]>([]);
  const [modelos, setModelos] = useState<Item[]>([]);
  const [anos, setAnos] = useState<Item[]>([]);
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [valor, setValor] = useState<Valor | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Carrega marcas ao trocar o tipo
  useEffect(() => {
    setMarcas([]);
    setModelos([]);
    setAnos([]);
    setMarca("");
    setModelo("");
    setAno("");
    setValor(null);
    setErro("");
    setLoading(true);
    fetchFipe<Item[]>(`${tipo}/marcas`)
      .then(setMarcas)
      .catch(() => setErro("Não consegui carregar as marcas."))
      .finally(() => setLoading(false));
  }, [tipo]);

  async function escolherMarca(m: string) {
    setMarca(m);
    setModelo("");
    setAno("");
    setModelos([]);
    setAnos([]);
    setValor(null);
    if (!m) return;
    setLoading(true);
    try {
      const data = await fetchFipe<{ modelos: Item[] }>(`${tipo}/marcas/${m}/modelos`);
      setModelos(data.modelos);
    } catch {
      setErro("Não consegui carregar os modelos.");
    } finally {
      setLoading(false);
    }
  }

  async function escolherModelo(mod: string) {
    setModelo(mod);
    setAno("");
    setAnos([]);
    setValor(null);
    if (!mod) return;
    setLoading(true);
    try {
      const data = await fetchFipe<Item[]>(
        `${tipo}/marcas/${marca}/modelos/${mod}/anos`,
      );
      setAnos(data);
    } catch {
      setErro("Não consegui carregar os anos.");
    } finally {
      setLoading(false);
    }
  }

  async function escolherAno(a: string) {
    setAno(a);
    setValor(null);
    if (!a) return;
    setLoading(true);
    try {
      const data = await fetchFipe<Valor>(
        `${tipo}/marcas/${marca}/modelos/${modelo}/anos/${a}`,
      );
      setValor(data);
    } catch {
      setErro("Não consegui consultar o valor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Tipo de veículo">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS.map((t) => (
              <option key={t.v} value={t.v}>
                {t.l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Marca">
          <Select
            value={marca}
            onChange={(e) => escolherMarca(e.target.value)}
            disabled={!marcas.length}
          >
            <option value="">Selecione…</option>
            {marcas.map((m) => (
              <option key={m.codigo} value={m.codigo}>
                {m.nome}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Modelo">
          <Select
            value={modelo}
            onChange={(e) => escolherModelo(e.target.value)}
            disabled={!modelos.length}
          >
            <option value="">Selecione…</option>
            {modelos.map((m) => (
              <option key={m.codigo} value={m.codigo}>
                {m.nome}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ano">
          <Select
            value={ano}
            onChange={(e) => escolherAno(e.target.value)}
            disabled={!anos.length}
          >
            <option value="">Selecione…</option>
            {anos.map((a) => (
              <option key={a.codigo} value={a.codigo}>
                {a.nome}
              </option>
            ))}
          </Select>
        </Field>
        {loading && <p className="text-sm text-muted">Carregando…</p>}
        {erro && <p className="text-sm text-rose-600">{erro}</p>}
      </div>

      <div>
        {valor ? (
          <ResultBox tone="consultas">
            <p className="text-sm font-medium text-muted">Valor de referência FIPE</p>
            <p className="my-1 text-3xl font-extrabold">{valor.Valor}</p>
            <Row label="Veículo" value={`${valor.Marca} ${valor.Modelo}`} />
            <Row label="Ano" value={`${valor.AnoModelo} · ${valor.Combustivel}`} />
            <Row label="Código FIPE" value={valor.CodigoFipe} />
            <Row label="Mês de referência" value={valor.MesReferencia.trim()} strong />
          </ResultBox>
        ) : (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Selecione marca, modelo e ano para ver o valor na Tabela FIPE.
          </div>
        )}
      </div>
    </div>
  );
}
