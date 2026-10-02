import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BlogListing } from "@/components/blog/BlogListing";
import { getPublishedPosts, totalPages } from "@/lib/blog";
import { BLOG_INTRO, BLOG_TITLE } from "@/lib/blog-shared";

export const revalidate = 3600;

/** O destaque da página 1 sai da grade; o total de páginas considera isso. */
function pagesFor(count: number) {
  return totalPages(count > 3 ? count - 1 : count);
}

export async function generateStaticParams() {
  const pages = pagesFor((await getPublishedPosts()).length);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `${BLOG_TITLE} — página ${n}`,
    description: BLOG_INTRO,
    alternates: { canonical: `/blog/pagina/${n}` },
  };
}

export default async function BlogPaginaPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const page = Number(n);
  if (page === 1) redirect("/blog");
  const posts = await getPublishedPosts();
  if (!Number.isInteger(page) || page < 2 || page > pagesFor(posts.length)) notFound();
  return (
    <BlogListing
      posts={posts}
      page={page}
      basePath="/blog"
      title={`${BLOG_TITLE} — página ${page}`}
      intro={BLOG_INTRO}
      showFeatured
    />
  );
}
