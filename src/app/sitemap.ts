import type { MetadataRoute } from "next";
import { CATEGORIES, SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = [
    "",
    "/ferramentas",
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

  const ferramentas = SERVICES.map((s) => ({
    url: `${SITE.url}/ferramentas/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: s.status === "live" ? 0.8 : 0.4,
  }));

  return [...staticPages, ...categorias, ...ferramentas];
}
