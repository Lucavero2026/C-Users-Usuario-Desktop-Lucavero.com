import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import {
  isLive,
  parsePost,
  readingMinutes,
  type BlogCategoryId,
  type Post,
} from "./blog-shared";

/**
 * Leitura dos artigos do blog (arquivos em content/blog/*.md).
 * Os artigos são criados e editados pelo painel em /admin/blog.
 */

export const BLOG_DIR = path.join(process.cwd(), "content", "blog");
export const POSTS_PER_PAGE = 12;

export interface PostWithMeta extends Post {
  readingMinutes: number;
}

/** Todos os arquivos, inclusive rascunhos e agendados (uso no painel). */
export const getAllPosts = cache(async (): Promise<PostWithMeta[]> => {
  let files: string[] = [];
  try {
    files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const posts = await Promise.all(
    files.map(async (f) => {
      const raw = await readFile(path.join(BLOG_DIR, f), "utf8");
      const p = parsePost(raw, f.replace(/\.md$/, ""));
      return { ...p, readingMinutes: readingMinutes(p.body) };
    }),
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
});

/** Só os artigos publicados com data já alcançada, do mais novo ao mais antigo. */
export async function getPublishedPosts(): Promise<PostWithMeta[]> {
  const now = Date.now();
  return (await getAllPosts())
    .filter((p) => isLive(p, now))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPublishedPost(slug: string): Promise<PostWithMeta | undefined> {
  return (await getPublishedPosts()).find((p) => p.slug === slug);
}

export async function getPostsByCategory(id: BlogCategoryId): Promise<PostWithMeta[]> {
  return (await getPublishedPosts()).filter((p) => p.category === id);
}

/** Artigos que citam uma ferramenta (para a página da ferramenta). */
export async function getPostsForTool(slug: string, limit = 3): Promise<PostWithMeta[]> {
  return (await getPublishedPosts()).filter((p) => p.related.includes(slug)).slice(0, limit);
}

/** Relacionados: mesma categoria, ferramentas ou tags em comum. */
export async function getRelatedPosts(post: Post, limit = 3): Promise<PostWithMeta[]> {
  const others = (await getPublishedPosts()).filter((p) => p.slug !== post.slug);
  const scored = others.map((p) => {
    let score = p.category === post.category ? 3 : 0;
    score += p.related.filter((r) => post.related.includes(r)).length * 2;
    score += p.tags.filter((t) => post.tags.includes(t)).length;
    return { p, score };
  });
  return scored
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, limit)
    .map((s) => s.p);
}

export function totalPages(count: number): number {
  return Math.max(1, Math.ceil(count / POSTS_PER_PAGE));
}
