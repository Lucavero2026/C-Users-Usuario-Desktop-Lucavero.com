import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell } from "lucide-react";
import { SERVICES, getService, servicesByCategory } from "@/lib/services";
import { ToolShell } from "@/components/ToolShell";
import { ToolLoader } from "@/components/tools/ToolLoader";
import { ServiceCard } from "@/components/ServiceCard";
import { JsonLd, serviceJsonLd } from "@/components/JsonLd";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Ferramenta não encontrada" };
  return {
    title: service.name,
    description: service.description,
    keywords: [service.name, ...service.keywords],
    alternates: { canonical: `/ferramentas/${service.slug}` },
    openGraph: {
      title: `${service.name} · Lucavero Multiserviços`,
      description: service.description,
    },
  };
}

export default async function FerramentaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const relacionadas = servicesByCategory(service.category)
    .filter((s) => s.slug !== service.slug)
    .slice(0, 3);

  return (
    <>
      <JsonLd data={serviceJsonLd(service)} />
      <ToolShell service={service}>
        {service.status === "live" ? (
          <ToolLoader slug={service.slug} />
        ) : (
          <ComingSoon aiTool={!!service.ai} />
        )}
      </ToolShell>

      {relacionadas.length > 0 && (
        <section className="container-page pb-4">
          <h2 className="mb-4 text-xl font-bold">Você também pode gostar</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relacionadas.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function ComingSoon({ aiTool }: { aiTool: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-muted p-8 text-center">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Bell className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-bold">Estamos preparando esta ferramenta</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        {aiTool
          ? "Esta é uma ferramenta com inteligência artificial e faz parte da próxima fase do Lucavero. Enquanto isso, explore as ferramentas já disponíveis."
          : "Esta ferramenta chega em breve. Enquanto isso, explore as que já estão no ar."}
      </p>
      <Link
        href="/ferramentas"
        className="focus-ring mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Ver ferramentas disponíveis
      </Link>
    </div>
  );
}
