import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogListing } from "@/components/blog/BlogListing";
import { JsonLd } from "@/components/JsonLd";
import { getPostsByCategory } from "@/lib/blog";
import { BLOG_CATEGORIES, getBlogCategory } from "@/lib/blog-shared";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((c) => ({ categoria: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const cat = getBlogCategory(categoria);
  if (!cat) return { title: "Categoria não encontrada" };
  return {
    title: `${cat.name} — artigos e guias`,
    description: cat.description,
    alternates: { canonical: `/blog/categoria/${cat.id}` },
    openGraph: {
      title: `${cat.name} · Blog Lucavero`,
      description: cat.description,
      url: `/blog/categoria/${cat.id}`,
    },
  };
}

export default async function BlogCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const cat = getBlogCategory(categoria);
  if (!cat) notFound();
  const posts = await getPostsByCategory(cat.id);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` },
            {
              "@type": "ListItem",
              position: 3,
              name: cat.name,
              item: `${SITE.url}/blog/categoria/${cat.id}`,
            },
          ],
        }}
      />
      <BlogListing
        posts={posts}
        page={1}
        basePath={`/blog/categoria/${cat.id}`}
        title={cat.name}
        intro={cat.description}
        activeCategory={cat.id}
      />
    </>
  );
}
