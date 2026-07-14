import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Programas sociais: seus direitos e como acessar",
  description:
    "Guia prático dos principais programas sociais do Brasil: CadÚnico, Bolsa Família, Tarifa Social, BPC e mais. Quem tem direito e como pedir.",
  alternates: { canonical: "/programas-sociais" },
  keywords: [
    "programas sociais",
    "cadastro único",
    "bolsa família",
    "tarifa social",
    "bpc",
    "auxílio",
  ],
};

const PROGRAMAS = [
  {
    emoji: "🤝",
    nome: "CadÚnico",
    desc: "A porta de entrada para quase todos os programas. Quem está no Cadastro Único pode acessar dezenas de benefícios.",
    href: "/blog/cadunico-e-programas-sociais",
    cta: "Como se cadastrar",
  },
  {
    emoji: "💡",
    nome: "Tarifa Social de Energia",
    desc: "Desconto na conta de luz para famílias de baixa renda inscritas no CadÚnico.",
    href: "/blog/tarifa-social-energia-eletrica",
    cta: "Como pedir o desconto",
  },
  {
    emoji: "👨‍👩‍👧",
    nome: "Bolsa Família",
    desc: "Transferência de renda para famílias em situação de pobreza. Depende do CadÚnico atualizado.",
    href: "https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia",
    cta: "Site oficial",
    externo: true,
  },
  {
    emoji: "♿",
    nome: "BPC/LOAS",
    desc: "Um salário mínimo para idosos (65+) e pessoas com deficiência de baixa renda. Não exige contribuição ao INSS.",
    href: "https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-assistenciais/bpc",
    cta: "Site oficial",
    externo: true,
  },
  {
    emoji: "🎓",
    nome: "ID Jovem",
    desc: "Meia-entrada em eventos e vagas gratuitas/com desconto em transporte interestadual para jovens de baixa renda.",
    href: "https://www.gov.br/mdh/pt-br",
    cta: "Site oficial",
    externo: true,
  },
  {
    emoji: "⚖️",
    nome: "Não sabe se tem direito?",
    desc: "Descreva sua situação e receba uma orientação inicial com base na lei brasileira.",
    href: "/ferramentas/consulte-seus-direitos",
    cta: "Consultar meus direitos",
  },
];

export default function ProgramasSociaisPage() {
  return (
    <div className="container-page py-10">
      <header className="mb-10 max-w-2xl">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/40">
          <HeartHandshake className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Programas sociais
        </h1>
        <p className="mt-3 text-lg text-muted">
          Muita gente tem direito a benefícios e não sabe. Reunimos os principais
          programas do Brasil, quem pode participar e como acessar — de forma
          simples e direta.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROGRAMAS.map((p) => (
          <div
            key={p.nome}
            className="card flex flex-col p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-3xl">{p.emoji}</span>
            <h2 className="mt-3 text-lg font-bold">{p.nome}</h2>
            <p className="mt-1 flex-1 text-sm text-muted">{p.desc}</p>
            <Link
              href={p.href}
              target={p.externo ? "_blank" : undefined}
              rel={p.externo ? "noopener noreferrer" : undefined}
              className="focus-ring mt-4 inline-flex w-fit rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              {p.cta} →
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-muted">
        Conteúdo informativo e gratuito. As regras podem mudar — confirme sempre
        no CRAS da sua cidade e nos canais oficiais do governo.
      </p>
    </div>
  );
}
