import type { Metadata } from "next";
import { CATEGORIES, servicesByCategory } from "@/lib/services";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceIcon } from "@/components/ServiceIcon";

export const metadata: Metadata = {
  title: "Todas as ferramentas",
  description:
    "Explore todas as ferramentas do Lucavero Multiserviços, organizadas por área: finanças, documentos, trabalho, consultas, utilidades e direitos.",
  alternates: { canonical: "/ferramentas" },
};

export default function FerramentasPage() {
  return (
    <div className="container-page py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Todas as ferramentas</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Tudo o que o Lucavero oferece, organizado por área. Clique e use — é
          grátis e sem cadastro.
        </p>
      </header>

      <div className="space-y-12">
        {CATEGORIES.map((c) => {
          const list = servicesByCategory(c.id);
          return (
            <section key={c.id} id={c.id} className="scroll-mt-20">
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: c.colorSoft, color: c.color }}
                >
                  <ServiceIcon name={c.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-bold">{c.name}</h2>
                  <p className="text-sm text-muted">{c.description}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                  <ServiceCard key={s.slug} service={s} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
