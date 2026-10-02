/**
 * Tipos, categorias e utilitários do blog que rodam tanto no servidor quanto
 * no navegador (o editor do painel usa estas mesmas funções).
 *
 * Cada artigo é um arquivo Markdown em `content/blog/<slug>.md`, com os
 * metadados num cabeçalho YAML (frontmatter) entre linhas `---`.
 */
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export type PostStatus = "publicado" | "rascunho";

export interface FaqItem {
  q: string;
  a: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  /** resumo exibido nos cards e usado como meta description */
  description: string;
  /** data/hora de publicação, ISO com fuso (ex.: 2026-10-02T08:00:00-03:00) */
  date: string;
  /** data da última atualização relevante (opcional) */
  updated?: string;
  category: BlogCategoryId;
  tags: string[];
  emoji: string;
  /** imagem de capa (caminho /blog/img/... ou URL) */
  cover?: string;
  coverAlt?: string;
  /** slugs de ferramentas do site relacionadas */
  related: string[];
  status: PostStatus;
  /** fixa o artigo no topo do blog */
  featured?: boolean;
  /** título alternativo para o Google (opcional; padrão = title) */
  seoTitle?: string;
  /** palavra-chave principal (usada só no checklist de SEO do editor) */
  keyword?: string;
  faq: FaqItem[];
}

export interface Post extends PostMeta {
  body: string;
}

// ---------------------------------------------------------------------------
// Categorias (fixas, para ter páginas de categoria com bom SEO)
// ---------------------------------------------------------------------------

export type BlogCategoryId =
  | "financas"
  | "investimentos"
  | "impostos"
  | "trabalho"
  | "mei"
  | "direitos"
  | "programas-sociais"
  | "ferramentas";

export interface BlogCategory {
  id: BlogCategoryId;
  name: string;
  description: string;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: "financas",
    name: "Finanças pessoais",
    description:
      "Orçamento, dívidas, juros, financiamentos e dicas práticas para organizar o seu dinheiro.",
  },
  {
    id: "investimentos",
    name: "Investimentos",
    description:
      "Poupança, CDB, Tesouro Direto, juros compostos e como fazer o dinheiro render com segurança.",
  },
  {
    id: "impostos",
    name: "Impostos",
    description:
      "Imposto de Renda, INSS, IRRF e as regras atualizadas explicadas em linguagem simples.",
  },
  {
    id: "trabalho",
    name: "Trabalho e salário",
    description:
      "Salário líquido, férias, 13º, rescisão e seus direitos como trabalhador.",
  },
  {
    id: "mei",
    name: "MEI e autônomos",
    description:
      "DAS, limites, cobrança, Pix e tudo o que o microempreendedor e o autônomo precisam saber.",
  },
  {
    id: "direitos",
    name: "Direitos do consumidor",
    description:
      "Como contestar cobranças, multas e entender contratos e notificações.",
  },
  {
    id: "programas-sociais",
    name: "Programas sociais",
    description:
      "CadÚnico, Bolsa Família, Tarifa Social e outros benefícios: quem tem direito e como pedir.",
  },
  {
    id: "ferramentas",
    name: "Guias das ferramentas",
    description: "Passo a passo para usar as calculadoras e ferramentas gratuitas do Lucavero.",
  },
];

export const BLOG_TITLE = "Blog de finanças e direitos";
export const BLOG_INTRO =
  "Artigos diários sobre finanças pessoais, impostos, trabalho, MEI e direitos — com calculadoras gratuitas para você aplicar na hora.";

export function getBlogCategory(id: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

/** "Como calcular o 13º!" → "como-calcular-o-13" */
export function slugify(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 90;
}

export function wordCount(markdown: string): number {
  const text = (markdown || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.round(wordCount(markdown) / 200));
}

/** Publicado e com data de publicação já alcançada. */
export function isLive(p: PostMeta, now = Date.now()): boolean {
  return p.status === "publicado" && new Date(p.date).getTime() <= now;
}

export type PostState = "publicado" | "agendado" | "rascunho";

export function postState(p: PostMeta, now = Date.now()): PostState {
  if (p.status !== "publicado") return "rascunho";
  return new Date(p.date).getTime() > now ? "agendado" : "publicado";
}

/** Data/hora local de Brasília no formato do <input type="datetime-local">. */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  // Converte para UTC−3 (Brasília não tem mais horário de verão).
  const br = new Date(d.getTime() - 3 * 3600_000);
  return br.toISOString().slice(0, 16);
}

/** "2026-10-02T08:00" (horário de Brasília) → "2026-10-02T08:00:00-03:00" */
export function fromLocalInput(local: string): string {
  if (!local) return "";
  return `${local.length === 16 ? `${local}:00` : local}-03:00`;
}

export function formatPostDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/** Artigo em branco para o editor (publicação “agora”, horário de Brasília). */
export function emptyPost(): Post {
  return {
    slug: "",
    title: "",
    description: "",
    date: fromLocalInput(toLocalInput(new Date().toISOString())),
    category: "financas",
    tags: [],
    emoji: "💰",
    related: [],
    status: "publicado",
    faq: [],
    body: "",
  };
}

// ---------------------------------------------------------------------------
// Leitura e escrita do arquivo Markdown
// ---------------------------------------------------------------------------

function str(v: unknown, fallback = ""): string {
  if (v instanceof Date) return v.toISOString();
  return v == null ? fallback : String(v);
}

function strList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string") return v.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
}

export function parsePost(raw: string, slug: string): Post {
  const text = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const data = (m ? (parseYaml(m[1]) as Record<string, unknown>) : {}) || {};
  const body = (m ? m[2] : text).trim();

  const category = str(data.category, "financas");
  const faqRaw = Array.isArray(data.faq) ? data.faq : [];
  return {
    slug,
    title: str(data.title, slug),
    description: str(data.description),
    date: str(data.date, "2026-01-01T08:00:00-03:00"),
    updated: data.updated ? str(data.updated) : undefined,
    category: (getBlogCategory(category)?.id ?? "financas") as BlogCategoryId,
    tags: strList(data.tags),
    emoji: str(data.emoji, "📝"),
    cover: data.cover ? str(data.cover) : undefined,
    coverAlt: data.coverAlt ? str(data.coverAlt) : undefined,
    related: strList(data.related),
    status: str(data.status) === "rascunho" ? "rascunho" : "publicado",
    featured: data.featured === true,
    seoTitle: data.seoTitle ? str(data.seoTitle) : undefined,
    keyword: data.keyword ? str(data.keyword) : undefined,
    faq: faqRaw
      .map((f) => ({
        q: str((f as Record<string, unknown>)?.q).trim(),
        a: str((f as Record<string, unknown>)?.a).trim(),
      }))
      .filter((f) => f.q && f.a),
    body,
  };
}

export function serializePost(p: Post): string {
  const meta: Record<string, unknown> = {
    title: p.title,
    description: p.description,
    date: p.date,
  };
  if (p.updated) meta.updated = p.updated;
  meta.category = p.category;
  meta.tags = p.tags;
  meta.emoji = p.emoji;
  if (p.cover) meta.cover = p.cover;
  if (p.coverAlt) meta.coverAlt = p.coverAlt;
  meta.related = p.related;
  meta.status = p.status;
  if (p.featured) meta.featured = true;
  if (p.seoTitle) meta.seoTitle = p.seoTitle;
  if (p.keyword) meta.keyword = p.keyword;
  if (p.faq.length) meta.faq = p.faq;
  const yaml = stringifyYaml(meta, { lineWidth: 0 }).trimEnd();
  return `---\n${yaml}\n---\n\n${p.body.trim()}\n`;
}

/** Valida e normaliza um post vindo do formulário do painel. */
export function sanitizePost(input: Partial<Post>): { post?: Post; error?: string } {
  const title = (input.title || "").trim();
  if (!title) return { error: "Informe o título do artigo." };
  const slug = (input.slug || slugify(title)).trim();
  if (!isValidSlug(slug))
    return { error: "Endereço (slug) inválido: use só letras minúsculas, números e hífens." };
  const body = (input.body || "").trim();
  if (!body) return { error: "O artigo está sem texto." };
  const date = input.date && !isNaN(new Date(input.date).getTime()) ? input.date : new Date().toISOString();
  const category = getBlogCategory(input.category || "")?.id ?? "financas";

  return {
    post: {
      slug,
      title: title.slice(0, 200),
      description: (input.description || "").trim().slice(0, 300),
      date,
      updated: input.updated || undefined,
      category,
      tags: strList(input.tags).slice(0, 12),
      emoji: (input.emoji || "📝").trim().slice(0, 8),
      cover: input.cover?.trim() || undefined,
      coverAlt: input.coverAlt?.trim() || undefined,
      related: strList(input.related),
      status: input.status === "rascunho" ? "rascunho" : "publicado",
      featured: !!input.featured,
      seoTitle: input.seoTitle?.trim() || undefined,
      keyword: input.keyword?.trim() || undefined,
      faq: (input.faq || [])
        .map((f) => ({ q: (f.q || "").trim(), a: (f.a || "").trim() }))
        .filter((f) => f.q && f.a),
      body,
    },
  };
}
