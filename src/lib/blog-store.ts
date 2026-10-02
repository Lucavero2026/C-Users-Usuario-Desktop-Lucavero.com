import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { BLOG_DIR } from "./blog";
import { parsePost, serializePost, type Post } from "./blog-shared";

/**
 * Gravação dos artigos e imagens do blog.
 *
 * - Em produção (Vercel), o disco é somente leitura: os arquivos são gravados
 *   no repositório do GitHub pela API. Cada gravação gera um commit e a Vercel
 *   publica o site atualizado em ~1 minuto. Custo zero.
 * - No computador (npm run dev), sem GITHUB_TOKEN, grava direto na pasta.
 *
 * Variáveis: GITHUB_TOKEN (token fine-grained com permissão "Contents: Read and
 * write" só neste repositório), GITHUB_REPO ("dono/repositorio") e
 * GITHUB_BRANCH (padrão "main").
 */

const PUBLIC_DIR = path.join(process.cwd(), "public");

export function storeMode(): "github" | "local" | "readonly" {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) return "github";
  if (process.env.VERCEL) return "readonly";
  return "local";
}

// ---------------------------------------------------------------------------
// GitHub (API de conteúdo)
// ---------------------------------------------------------------------------

function gh(pathInRepo: string, init?: RequestInit) {
  const repo = process.env.GITHUB_REPO;
  const url = `https://api.github.com/repos/${repo}/contents/${pathInRepo
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  return fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
  });
}

const branch = () => process.env.GITHUB_BRANCH || "main";

async function ghGet(pathInRepo: string): Promise<{ sha: string; content: string } | null> {
  const r = await gh(`${pathInRepo}?ref=${encodeURIComponent(branch())}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub respondeu ${r.status} ao ler ${pathInRepo}.`);
  const data = (await r.json()) as { sha: string; content: string };
  return { sha: data.sha, content: Buffer.from(data.content, "base64").toString("utf8") };
}

async function ghPut(pathInRepo: string, base64: string, message: string) {
  const current = await ghGet(pathInRepo).catch(() => null);
  const r = await gh(pathInRepo, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: base64,
      branch: branch(),
      ...(current ? { sha: current.sha } : {}),
    }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`GitHub respondeu ${r.status} ao gravar: ${detail.slice(0, 200)}`);
  }
}

async function ghDelete(pathInRepo: string, message: string) {
  const current = await ghGet(pathInRepo);
  if (!current) return;
  const r = await gh(pathInRepo, {
    method: "DELETE",
    body: JSON.stringify({ message, sha: current.sha, branch: branch() }),
  });
  if (!r.ok) throw new Error(`GitHub respondeu ${r.status} ao excluir.`);
}

// ---------------------------------------------------------------------------
// API usada pelo painel
// ---------------------------------------------------------------------------

const postPath = (slug: string) => `content/blog/${slug}.md`;

/** Lê a versão mais recente de um artigo (do GitHub, se configurado). */
export async function loadPost(slug: string): Promise<Post | null> {
  if (storeMode() === "github") {
    const f = await ghGet(postPath(slug));
    return f ? parsePost(f.content, slug) : null;
  }
  try {
    return parsePost(await readFile(path.join(BLOG_DIR, `${slug}.md`), "utf8"), slug);
  } catch {
    return null;
  }
}

export async function postExists(slug: string): Promise<boolean> {
  return (await loadPost(slug)) !== null;
}

export async function savePost(post: Post, previousSlug?: string): Promise<void> {
  const mode = storeMode();
  if (mode === "readonly") throw new Error(READONLY_MSG);
  const content = serializePost(post);
  const verbo = post.status === "rascunho" ? "rascunho" : "publica";

  if (mode === "github") {
    await ghPut(
      postPath(post.slug),
      Buffer.from(content, "utf8").toString("base64"),
      `Blog (${verbo}): ${post.title}`,
    );
    if (previousSlug && previousSlug !== post.slug) {
      await ghDelete(postPath(previousSlug), `Blog: renomeia ${previousSlug} → ${post.slug}`);
    }
    return;
  }
  await mkdir(BLOG_DIR, { recursive: true });
  await writeFile(path.join(BLOG_DIR, `${post.slug}.md`), content, "utf8");
  if (previousSlug && previousSlug !== post.slug) {
    await unlink(path.join(BLOG_DIR, `${previousSlug}.md`)).catch(() => {});
  }
}

export async function deletePost(slug: string): Promise<void> {
  const mode = storeMode();
  if (mode === "readonly") throw new Error(READONLY_MSG);
  if (mode === "github") return ghDelete(postPath(slug), `Blog: exclui ${slug}`);
  await unlink(path.join(BLOG_DIR, `${slug}.md`));
}

/** Grava uma imagem em public/blog/img/AAAA/ e devolve o caminho público. */
export async function saveImage(name: string, data: Buffer): Promise<string> {
  const mode = storeMode();
  if (mode === "readonly") throw new Error(READONLY_MSG);
  const year = new Date().getFullYear();
  const rel = `blog/img/${year}/${name}`;
  if (mode === "github") {
    await ghPut(`public/${rel}`, data.toString("base64"), `Blog: imagem ${name}`);
  } else {
    const full = path.join(PUBLIC_DIR, rel);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, data);
  }
  return `/${rel}`;
}

const READONLY_MSG =
  "Publicação desativada: configure GITHUB_TOKEN e GITHUB_REPO nas variáveis de ambiente da Vercel.";
