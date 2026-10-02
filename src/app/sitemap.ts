import type { MetadataRoute } from "next";
import { CATEGORIES, SERVICES } from "@/lib/services";
import { getPublishedPosts } from "@/lib/blog";
import { BLOG_CATEGORIES } from "@/lib/blog-shared";
import { SITE } from "@/lib/site";

// Atualiza de hora em hora (inclui artigos agendados que entraram no ar).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = [
    "",
    "/ferramentas",
    "/blog",
    "/programas-sociais",
    "/sobre",
    "/contato",
    "/privacidade",
    "/termos",
    "/cookies",
  ].map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.6,
  }));

  const categorias = CATEGORIES.map((c) => ({
    url: `${SITE.url}/categoria/${c.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const ferramentas = SERVICES.filter((s) => s.status === "live").map((s) => ({
    url: `${SITE.url}/ferramentas/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const posts = await getPublishedPosts();
  const artigos = posts.map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: new Date(p.updated || p.date),
    changeFrequency: "weekly" as const,
    priority: 0.7,
    ...(p.cover ? { images: [new URL(p.cover, SITE.url).toString()] } : {}),
  }));

  const categoriasBlog = BLOG_CATEGORIES.map((c) => ({
    url: `${SITE.url}/blog/categoria/${c.id}`,
    lastModified: posts.find((p) => p.category === c.id)?.date
      ? new Date(posts.find((p) => p.category === c.id)!.date)
      : now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categorias, ...ferramentas, ...categoriasBlog, ...artigos];
}
