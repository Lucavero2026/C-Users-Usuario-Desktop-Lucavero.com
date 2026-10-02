import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell } from "lucide-react";
import { SERVICES, getService, servicesByCategory } from "@/lib/services";
import { ToolShell } from "@/components/ToolShell";
import { ToolLoader } from "@/components/tools/ToolLoader";
import { ServiceCard } from "@/components/ServiceCard";
import { JsonLd, serviceJsonLd } from "@/components/JsonLd";
import { PostCard } from "@/components/blog/BlogListing";
import { getPostsForTool } from "@/lib/blog";
import { renderPost } from "@/lib/blog-render";
import { TOOL_CONTENT } from "@/lib/tool-content";

// Revalida de hora em hora para listar artigos novos do blog sobre a ferramenta.
export const revalidate = 3600;

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
    // Ferramentas "em breve" não têm conteúdo útil ainda: fora do índice do Google.
    ...(service.status !== "live" ? { robots: { index: false, follow: true } } : {}),
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
    .filter((s) => s.slug !== service.slug && s.status === "live")
    .slice(0, 3);
  const artigos = service.status === "live" ? await getPostsForTool(service.slug) : [];
  const conteudo = service.status === "live" ? TOOL_CONTENT[service.slug] : undefined;

  return (
    <>
      <JsonLd data={serviceJsonLd(service)} />
      {conteudo && conteudo.faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: conteudo.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      )}
      <ToolShell service={service}>
        {service.status === "live" ? (
          <ToolLoader slug={service.slug} />
        ) : (
          <ComingSoon aiTool={!!service.ai} />
        )}
      </ToolShell>

      {conteudo && (
        <section className="container-page pb-6">
          <div className="mx-auto max-w-3xl">
            <div
              className="prose-lv"
              dangerouslySetInnerHTML={{ __html: renderPost(conteudo.body).html }}
            />
            {conteudo.faq.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-xl font-bold">Perguntas frequentes</h2>
                <div className="space-y-2">
                  {conteudo.faq.map((f) => (
                    <details key={f.q} className="group rounded-xl border border-border bg-surface p-4">
                      <summary className="cursor-pointer list-none font-semibold">
                        <span className="mr-2 inline-block text-brand transition-transform group-open:rotate-90">›</span>
                        {f.q}
                      </summary>
                      <p className="mt-2 leading-relaxed text-muted">{f.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {artigos.length > 0 && (
        <section className="container-page pb-6">
          <h2 className="mb-4 text-xl font-bold">Artigos sobre o assunto</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {artigos.map((p) => (
              <PostCard key={p.slug} post={p} headingLevel="h3" />
            ))}
          </div>
        </section>
      )}

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
