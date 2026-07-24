"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Lock, Rocket, ShieldCheck } from "lucide-react";
import { Button, Field, Input, ResultBox, Row } from "@/components/ui";

interface Dados {
  tipo?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  cor?: string;
  combustivel?: string;
  municipio?: string;
  uf?: string;
}
interface Situacao {
  rouboFurto?: boolean;
  sinistro?: boolean;
  leilao?: boolean;
}
interface Resposta {
  status: "ok" | "not_configured" | "error";
  placa?: string;
  dados?: Dados;
  situacao?: Situacao;
  fipe?: { valor?: string; codigo?: string };
  error?: string;
}

const CHECAGENS = [
  "Marca, modelo e ano",
  "Cor e tipo do veículo",
  "Combustível, cidade e estado",
];

function formatarPlaca(v: string): string {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
}

export default function DiagnosticoVeiculo() {
  const [placa, setPlaca] = useState("");
  const [res, setRes] = useState<Resposta | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Preenche a placa quando vem do quadro de destaque da home (?placa=...).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("placa");
    if (p) setPlaca(formatarPlaca(p));
  }, []);

  async function consultar() {
    setErro("");
    setRes(null);
    if (placa.length < 7) {
      setErro("Digite a placa completa (ex.: ABC1234 ou ABC1D23).");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/veiculo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa }),
      });
      const data: Resposta = await r.json();
      if (data.status === "error") {
        setErro(data.error || "Não consegui consultar agora.");
        return;
      }
      setRes(data);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            consultar();
          }}
          className="space-y-4"
        >
          <Field label="Placa do veículo" hint="Formato antigo (ABC1234) ou Mercosul (ABC1D23).">
            <Input
              value={placa}
              onChange={(e) => setPlaca(formatarPlaca(e.target.value))}
              placeholder="ABC1D23"
              className="text-center text-lg font-bold uppercase tracking-[0.3em]"
              autoCapitalize="characters"
            />
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Consultando…" : "Consultar veículo"}
          </Button>
          {erro && <p className="text-sm text-rose-600">{erro}</p>}
        </form>

        <div className="rounded-2xl border border-border bg-surface-muted p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-brand" /> Consulta grátis mostra
          </p>
          <ul className="space-y-1.5 text-sm text-muted">
            {CHECAGENS.map((c) => (
              <li key={c} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Usamos apenas dados públicos do veículo. Não exibimos dados do
            proprietário.
          </p>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Consultando a situação do veículo…
          </div>
        ) : res?.status === "not_configured" ? (
          <div className="rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-brand">
              <Rocket className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Lançamento em breve 🚗</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Estamos nos últimos ajustes para liberar o diagnóstico completo por
              placa. Enquanto isso, já dá para consultar o valor de mercado do seu
              veículo:
            </p>
            <Link
              href="/ferramentas/consulta-fipe"
              className="focus-ring mt-4 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Consultar valor na Tabela FIPE →
            </Link>
          </div>
        ) : res?.status === "ok" ? (
          <Relatorio res={res} />
        ) : (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Digite a placa para ver a situação do veículo.
          </div>
        )}
      </div>
    </div>
  );
}

const COMPLETO = [
  "Situação de roubo / furto",
  "Débitos, IPVA e multas",
  "Sinistro (perda total) e leilão",
  "Valor de avaliação (FIPE)",
];

function Relatorio({ res }: { res: Resposta }) {
  const d = res.dados || {};
  return (
    <div className="space-y-4">
      <ResultBox tone="consultas">
        <p className="mb-2 text-sm font-medium text-muted">
          Dados do veículo — placa {res.placa}
        </p>
        {(d.marca || d.modelo) && (
          <Row label="Veículo" value={`${d.marca || ""} ${d.modelo || ""}`.trim()} />
        )}
        {d.ano && <Row label="Ano" value={d.ano} />}
        {d.cor && <Row label="Cor" value={d.cor} />}
        {d.tipo && <Row label="Tipo" value={d.tipo} />}
        {d.combustivel && <Row label="Combustível" value={d.combustivel} />}
        {(d.municipio || d.uf) && (
          <Row
            label="Local"
            value={`${d.municipio || ""} ${d.uf ? "/ " + d.uf : ""}`.trim()}
            strong
          />
        )}
      </ResultBox>

      <UpsellCompleto />
    </div>
  );
}

function UpsellCompleto() {
  const [aviso, setAviso] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand-soft to-surface p-5">
      <p className="text-base font-bold text-foreground">
        Ninguém é mais honesto com você do que você mesmo!
      </p>
      <p className="mt-1 text-sm text-muted">
        Evite dores de cabeça: faça a{" "}
        <strong className="text-foreground">consulta completa</strong> (inclusive
        leilão) e compre com segurança.
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-muted">
        {COMPLETO.map((c) => (
          <li key={c} className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            {c}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setAviso(true)}
        className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-600 sm:w-auto"
      >
        <Lock className="h-4 w-4" /> Fazer consulta completa — R$ 59,00
      </button>
      {aviso && (
        <p className="mt-3 rounded-xl bg-surface-muted p-3 text-sm text-muted">
          🚧 O pagamento por Pix está sendo ativado — em breve você poderá liberar
          o relatório completo aqui mesmo.
        </p>
      )}
    </div>
  );
}
