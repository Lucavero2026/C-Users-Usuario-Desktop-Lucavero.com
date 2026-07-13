import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  CATEGORIES,
  getCategory,
  servicesByCategory,
  type CategoryId,
} from "@/lib/services";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceIcon } from "@/components/ServiceIcon";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

const VALID = new Set(CATEGORIES.map((c) => c.id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!VALID.has(id as CategoryId)) return { title: "Categoria" };
  const cat = getCategory(id as CategoryId);
  return {
    title: cat.name,
    description: cat.description,
    alternates: { canonical: `/categoria/${cat.id}` },
  };
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!VALID.has(id as CategoryId)) notFound();
  const cat = getCategory(id as CategoryId);
  const list = servicesByCategory(cat.id);

  return (
    <div className="container-page py-8">
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          Início
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{cat.name}</span>
      </nav>

      <header className="mb-8 flex items-start gap-4">
        <span
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: cat.colorSoft, color: cat.color }}
        >
          <ServiceIcon name={cat.icon} className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{cat.name}</h1>
          <p className="mt-1 max-w-2xl text-muted">{cat.description}</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-2">
        <span className="text-sm text-muted">Outras áreas:</span>
        {CATEGORIES.filter((c) => c.id !== cat.id).map((c) => (
          <Link
            key={c.id}
            href={`/categoria/${c.id}`}
            className="focus-ring rounded-full border border-border px-3 py-1 text-sm hover:border-brand hover:text-brand"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
