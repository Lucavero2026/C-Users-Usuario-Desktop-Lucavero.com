import { getPublishedPosts } from "@/lib/blog";
import { getBlogCategory } from "@/lib/blog-shared";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Feed RSS do blog (agregadores de notícias, leitores de feed, automações). */
export async function GET() {
  const posts = (await getPublishedPosts()).slice(0, 50);
  const items = posts
    .map((p) => {
      const url = `${SITE.url}/blog/${p.slug}`;
      return [
        "    <item>",
        `      <title>${esc(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(p.date).toUTCString()}</pubDate>`,
        `      <category>${esc(getBlogCategory(p.category)?.name || "")}</category>`,
        `      <description>${esc(p.description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>Blog · ${esc(SITE.name)}</title>`,
    `    <link>${SITE.url}/blog</link>`,
    "    <description>Finanças pessoais, impostos, trabalho, MEI e direitos — com ferramentas gratuitas.</description>",
    "    <language>pt-BR</language>",
    `    <atom:link href="${SITE.url}/blog/rss.xml" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
