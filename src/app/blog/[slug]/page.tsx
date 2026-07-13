import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { marked } from "marked";
import { POSTS, getPost } from "@/lib/blog";
import { getService } from "@/lib/services";
import { SITE } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Artigo não encontrado" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const html = marked.parse(post.body) as string;
  const related = (post.related || [])
    .map((s) => getService(s))
    .filter((s): s is NonNullable<typeof s> => !!s && s.status === "live");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: "pt-BR",
    author: { "@type": "Organization", name: SITE.owner },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };

  return (
    <article className="container-page max-w-3xl py-10">
      <JsonLd data={jsonLd} />
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          Início
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/blog" className="hover:text-brand">
          Blog
        </Link>
      </nav>

      <div className="text-4xl">{post.emoji}</div>
      <span className="mt-3 inline-flex rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
        {post.tag}
      </span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {new Date(post.date + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div
        className="prose-lv mt-8"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {related.length > 0 && (
        <div className="mt-12 rounded-2xl border border-border bg-surface-muted p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Ferramentas citadas
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((s) => (
              <Link
                key={s.slug}
                href={`/ferramentas/${s.slug}`}
                className="focus-ring rounded-full border border-border bg-surface px-3.5 py-2 text-sm hover:border-brand hover:text-brand"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <Link href="/blog" className="text-sm font-medium text-brand hover:underline">
          ← Voltar para o blog
        </Link>
      </div>
    </article>
  );
}
