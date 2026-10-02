import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BlogListing } from "@/components/blog/BlogListing";
import { getPostsByCategory, totalPages } from "@/lib/blog";
import { getBlogCategory } from "@/lib/blog-shared";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; n: string }>;
}): Promise<Metadata> {
  const { categoria, n } = await params;
  const cat = getBlogCategory(categoria);
  if (!cat) return { title: "Categoria não encontrada" };
  return {
    title: `${cat.name} — página ${n}`,
    description: cat.description,
    alternates: { canonical: `/blog/categoria/${cat.id}/pagina/${n}` },
  };
}

export default async function CategoriaPaginaPage({
  params,
}: {
  params: Promise<{ categoria: string; n: string }>;
}) {
  const { categoria, n } = await params;
  const cat = getBlogCategory(categoria);
  if (!cat) notFound();
  const page = Number(n);
  if (page === 1) redirect(`/blog/categoria/${cat.id}`);
  const posts = await getPostsByCategory(cat.id);
  if (!Number.isInteger(page) || page < 2 || page > totalPages(posts.length)) notFound();
  return (
    <BlogListing
      posts={posts}
      page={page}
      basePath={`/blog/categoria/${cat.id}`}
      title={`${cat.name} — página ${page}`}
      intro={cat.description}
      activeCategory={cat.id}
    />
  );
}
