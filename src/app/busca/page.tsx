import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { searchServices } from "@/lib/services";
import { ServiceCard } from "@/components/ServiceCard";

export const metadata: Metadata = {
  title: "Busca",
  robots: { index: false, follow: true },
};

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? searchServices(query) : [];

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold tracking-tight">
        {query ? (
          <>
            Resultados para <span className="text-brand">“{query}”</span>
          </>
        ) : (
          "Buscar"
        )}
      </h1>

      {query && results.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-muted">
            {results.length} ferramenta(s) encontrada(s).
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface-muted p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold">
            {query
              ? "Ainda não temos uma ferramenta exata para isso"
              : "Digite algo para buscar"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Em breve a busca inteligente com IA vai entender sua pergunta em
            linguagem natural e te levar direto à resposta. Por enquanto, explore
            as ferramentas disponíveis.
          </p>
          <Link
            href="/ferramentas"
            className="focus-ring mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Ver todas as ferramentas
          </Link>
        </div>
      )}
    </div>
  );
}
