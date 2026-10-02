import type { Metadata } from "next";
import { BlogListing } from "@/components/blog/BlogListing";
import { JsonLd } from "@/components/JsonLd";
import { getPublishedPosts } from "@/lib/blog";
import { BLOG_INTRO, BLOG_TITLE } from "@/lib/blog-shared";
import { SITE } from "@/lib/site";

// Revalida de hora em hora: artigos agendados aparecem sozinhos no horário.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: BLOG_INTRO,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  openGraph: {
    title: `${BLOG_TITLE} · Lucavero`,
    description: BLOG_INTRO,
    type: "website",
    url: "/blog",
  },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${BLOG_TITLE} · ${SITE.name}`,
          description: BLOG_INTRO,
          url: `${SITE.url}/blog`,
          inLanguage: "pt-BR",
          publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          blogPost: posts.slice(0, 12).map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE.url}/blog/${p.slug}`,
            datePublished: p.date,
          })),
        }}
      />
      <BlogListing
        posts={posts}
        page={1}
        basePath="/blog"
        title={BLOG_TITLE}
        intro={BLOG_INTRO}
        showFeatured
      />
    </>
  );
}
