import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceIcon } from "@/components/ServiceIcon";
import {
  CATEGORIES,
  LIVE_SERVICES,
  SERVICES,
  servicesByCategory,
} from "@/lib/services";

const CHIPS = [
  { label: "Salário líquido", slug: "salario-liquido" },
  { label: "Gerar Pix", slug: "pix-copia-e-cola" },
  { label: "Consultar CEP", slug: "consulta-cep" },
  { label: "Validar CPF", slug: "gerador-de-documentos" },
  { label: "Link do WhatsApp", slug: "link-whatsapp" },
];

export default function Home() {
  const featured = LIVE_SERVICES.slice(0, 8);

  return (
    <div>
      {/* HERO — busca central estilo Google */}
      <section className="home-glow">
        <div className="container-page flex flex-col items-center pt-16 pb-14 text-center sm:pt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            {SERVICES.length}+ serviços · grátis · sem cadastro
          </div>

          <h1 className="max-w-3xl text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            Resolva tudo{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
              num só lugar
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-lg text-muted">
            Ferramentas inteligentes para finanças, documentos, trabalho e o dia a
            dia. Pergunte com suas palavras — a gente te leva direto ao serviço.
          </p>

          <div className="mt-9 w-full">
            <SearchBar />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {CHIPS.map((c) => (
              <Link
                key={c.slug}
                href={`/ferramentas/${c.slug}`}
                className="focus-ring rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-foreground/80 transition-colors hover:border-brand hover:text-brand"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIAS — cards icônicos */}
      <section className="container-page py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/categoria/${c.id}`}
              className="focus-ring group flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                style={{ background: c.colorSoft, color: c.color }}
              >
                <ServiceIcon name={c.icon} className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold leading-tight text-foreground">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="container-page py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Mais usados</h2>
            <p className="text-sm text-muted">Comece pelas ferramentas favoritas.</p>
          </div>
          <Link
            href="/ferramentas"
            className="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-brand hover:underline"
          >
            Ver todas →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      {/* TODOS OS SERVIÇOS por área (botões antes do rodapé) */}
      <section className="container-page pb-8">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">
          Todos os serviços
        </h2>
        <div className="space-y-8">
          {CATEGORIES.map((c) => {
            const list = servicesByCategory(c.id);
            return (
              <div key={c.id}>
                <div className="mb-3 flex items-center gap-2.5">
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: c.colorSoft, color: c.color }}
                  >
                    <ServiceIcon name={c.icon} className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-lg font-semibold">{c.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {list.map((s) => {
                    const soon = s.status === "soon";
                    const cls =
                      "focus-ring inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors";
                    if (soon) {
                      return (
                        <span
                          key={s.slug}
                          className={`${cls} cursor-default border-border bg-surface-muted text-muted`}
                        >
                          {s.name}
                          <span className="text-[0.62rem] font-semibold uppercase">
                            em breve
                          </span>
                        </span>
                      );
                    }
                    return (
                      <Link
                        key={s.slug}
                        href={`/ferramentas/${s.slug}`}
                        className={`${cls} border-border bg-surface text-foreground/85 hover:border-brand hover:text-brand`}
                      >
                        {s.name}
                        {s.ai && (
                          <span className="rounded bg-brand-soft px-1.5 text-[0.6rem] font-bold text-brand">
                            IA
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
