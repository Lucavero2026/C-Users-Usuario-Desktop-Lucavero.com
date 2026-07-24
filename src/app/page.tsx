import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceIcon } from "@/components/ServiceIcon";
import {
  CATEGORIES,
  LIVE_SERVICES,
  SERVICES,
  getCategory,
  servicesByCategory,
} from "@/lib/services";
import { SORTED_POSTS } from "@/lib/blog";
import { VeiculoSpotlight } from "@/components/VeiculoSpotlight";

// Destaques (sem o diagnóstico de veículo, que tem seu próprio quadro no topo).
const FEATURED = SERVICES.filter(
  (s) => s.featured && s.status === "live" && s.slug !== "diagnostico-veiculo",
);

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

      {/* CARRO-CHEFE — diagnóstico de veículo em primeiro lugar */}
      <VeiculoSpotlight />

      {/* DESTAQUES — serviços de maior tráfego, com visual próprio */}
      <section className="container-page pt-4 pb-2">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <h2 className="text-xl font-bold tracking-tight">Serviços em destaque</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((s) => {
            const cat = getCategory(s.category);
            return (
              <Link
                key={s.slug}
                href={`/ferramentas/${s.slug}`}
                className="focus-ring group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className="flex items-center gap-3 p-5"
                  style={{ background: cat.colorSoft }}
                >
                  <span
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm"
                    style={{ color: cat.color }}
                  >
                    <ServiceIcon name={s.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="text-lg font-bold text-foreground">{s.name}</h3>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="flex-1 text-sm text-muted">{s.short}</p>
                  <span
                    className="mt-4 text-sm font-semibold"
                    style={{ color: cat.color }}
                  >
                    Abrir agora →
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Card especial: Programas Sociais */}
          <Link
            href="/programas-sociais"
            className="focus-ring group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center gap-3 bg-rose-100 p-5 dark:bg-rose-950/40">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/70 text-rose-600 shadow-sm">
                <ServiceIcon name="HeartHandshake" className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold text-foreground">Programas sociais</h3>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="flex-1 text-sm text-muted">
                CadÚnico, Bolsa Família, Tarifa Social e mais — quem tem direito e
                como acessar.
              </p>
              <span className="mt-4 text-sm font-semibold text-rose-600">
                Ver o guia →
              </span>
            </div>
          </Link>
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

      {/* BLOG — antes do rodapé */}
      <section className="border-t border-border bg-surface-muted">
        <div className="container-page py-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Do nosso blog</h2>
              <p className="text-sm text-muted">
                Guias de como usar as ferramentas e acessar seus direitos.
              </p>
            </div>
            <Link
              href="/blog"
              className="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-brand hover:underline"
            >
              Ver o blog →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SORTED_POSTS.slice(0, 3).map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="focus-ring card group flex flex-col p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-3xl">{p.emoji}</span>
                <span className="mt-3 inline-flex w-fit rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
                  {p.tag}
                </span>
                <h3 className="mt-2 font-bold leading-snug group-hover:text-brand">
                  {p.title}
                </h3>
                <p className="mt-1 flex-1 text-sm text-muted">{p.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
