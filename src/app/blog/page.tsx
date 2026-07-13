import type { Metadata } from "next";
import Link from "next/link";
import { SORTED_POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guias práticos sobre como usar as ferramentas do Lucavero e como acessar programas sociais e direitos no Brasil.",
  alternates: { canonical: "/blog" },
};

function fmt(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  return (
    <div className="container-page py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Guias diretos ao ponto: como usar as ferramentas do site e como acessar
          programas sociais e seus direitos.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SORTED_POSTS.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="focus-ring card group flex flex-col p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-3xl">{p.emoji}</span>
            <span className="mt-3 inline-flex w-fit rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
              {p.tag}
            </span>
            <h2 className="mt-2 text-lg font-bold leading-snug group-hover:text-brand">
              {p.title}
            </h2>
            <p className="mt-1 flex-1 text-sm text-muted">{p.description}</p>
            <span className="mt-4 text-xs text-muted">{fmt(p.date)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
