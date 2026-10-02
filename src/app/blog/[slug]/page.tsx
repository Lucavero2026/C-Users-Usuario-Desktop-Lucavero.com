import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";
import { getPublishedPost, getPublishedPosts, getRelatedPosts } from "@/lib/blog";
import { formatPostDate, getBlogCategory } from "@/lib/blog-shared";
import { renderPost } from "@/lib/blog-render";
import { getService } from "@/lib/services";
import { SITE } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { PostCard } from "@/components/blog/BlogListing";
import { ServiceCard } from "@/components/ServiceCard";

// Revalida de hora em hora (artigos agendados entram no ar sozinhos).
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Artigo não encontrado", robots: { index: false } };
  const title = post.seoTitle || post.title;
  return {
    // Título curto no Google: sem o sufixo longo do site.
    title: { absolute: `${title} | Lucavero` },
    description: post.description,
    keywords: [post.keyword, ...post.tags].filter(Boolean) as string[],
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: SITE.name, url: SITE.url }],
    openGraph: {
      title,
      description: post.description,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      section: getBlogCategory(post.category)?.name,
      tags: post.tags,
      images: [
        {
          url: post.cover || `/api/og/blog/${post.slug}`,
          width: 1200,
          height: 630,
          alt: post.coverAlt || title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.description,
      images: [post.cover || `/api/og/blog/${post.slug}`],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const { html, toc } = renderPost(post.body);
  const cat = getBlogCategory(post.category);
  const tools = post.related
    .map((s) => getService(s))
    .filter((s): s is NonNullable<typeof s> => !!s && s.status === "live");
  const related = await getRelatedPosts(post);
  const url = `${SITE.url}/blog/${post.slug}`;
  const image = post.cover
    ? new URL(post.cover, SITE.url).toString()
    : `${SITE.url}/api/og/blog/${post.slug}`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      inLanguage: "pt-BR",
      articleSection: cat?.name,
      keywords: [post.keyword, ...post.tags].filter(Boolean).join(", "),
      wordCount: post.body.split(/\s+/).length,
      author: { "@type": "Organization", name: SITE.name, url: SITE.url },
      publisher: {
        "@type": "Organization",
        name: SITE.name,
        url: SITE.url,
        logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
        ...(cat
          ? [{ "@type": "ListItem", position: 3, name: cat.name, item: `${SITE.url}/blog/categoria/${cat.id}` }]
          : []),
        { "@type": "ListItem", position: cat ? 4 : 3, name: post.title, item: url },
      ],
    },
  ];
  if (post.faq.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  const shareText = encodeURIComponent(`${post.title} ${url}`);
  const shares = [
    { label: "WhatsApp", href: `https://wa.me/?text=${shareText}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${shareText}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  ];

  return (
    <article className="container-page py-10">
      {jsonLd.map((d, i) => (
        <JsonLd key={i} data={d} />
      ))}

      <div className="mx-auto max-w-3xl">
        <nav aria-label="Navegação" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted">
          <Link href="/" className="hover:text-brand">Início</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-brand">Blog</Link>
          {cat && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/blog/categoria/${cat.id}`} className="hover:text-brand">{cat.name}</Link>
            </>
          )}
        </nav>

        <header>
          {cat && (
            <Link
              href={`/blog/categoria/${cat.id}`}
              className="inline-flex rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand"
            >
              {cat.name}
            </Link>
          )}
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          {post.description && <p className="mt-3 text-lg text-muted">{post.description}</p>}
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            <span>Por {SITE.name}</span>·
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            {post.updated && (
              <>
                · <span>Atualizado em <time dateTime={post.updated}>{formatPostDate(post.updated)}</time></span>
              </>
            )}
            · <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readingMinutes} min de leitura</span>
          </p>
        </header>

        {post.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover}
            alt={post.coverAlt || ""}
            className="mt-8 aspect-[1200/630] w-full rounded-2xl object-cover"
            fetchPriority="high"
          />
        ) : null}

        {toc.length >= 3 && (
          <nav aria-label="Neste artigo" className="mt-8 rounded-2xl border border-border bg-surface-muted p-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Neste artigo</p>
            <ol className="space-y-1 text-sm">
              {toc
                .filter((t) => t.depth === 2)
                .map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="text-foreground/80 hover:text-brand">
                      {t.text}
                    </a>
                  </li>
                ))}
            </ol>
          </nav>
        )}

        <div
          className="prose-lv mt-8"
          // Conteúdo escrito pelo administrador do site no painel.
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {post.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">Perguntas frequentes</h2>
            <div className="space-y-3">
              {post.faq.map((f) => (
                <details key={f.q} className="group rounded-xl border border-border bg-surface p-4">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">
                    <span className="mr-2 inline-block text-brand transition-transform group-open:rotate-90">›</span>
                    {f.q}
                  </summary>
                  <p className="mt-2 leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {tools.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold">Ferramentas gratuitas deste artigo</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {tools.map((s) => (
                <ServiceCard key={s.slug} service={s} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6 text-sm">
          <span className="font-medium">Compartilhe:</span>
          {shares.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-3 py-1.5 hover:border-brand hover:text-brand"
            >
              {s.label}
            </a>
          ))}
        </div>

        {post.tags.length > 0 && (
          <p className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-surface-muted px-2.5 py-1">#{t}</span>
            ))}
          </p>
        )}

        <p className="mt-8 text-xs text-muted">
          Conteúdo informativo. Regras e valores podem mudar — confirme sempre nas fontes oficiais.
        </p>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-14 max-w-5xl">
          <h2 className="mb-5 text-2xl font-bold">Leia também</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} headingLevel="h3" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
