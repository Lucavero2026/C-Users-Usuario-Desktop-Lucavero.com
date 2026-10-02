/**
 * Converte o Markdown de um artigo em HTML (no servidor e na pré-visualização
 * do editor), com:
 * - âncoras nos subtítulos (para o sumário e links diretos);
 * - links externos abrindo em nova aba com rel seguro;
 * - atalho [[ferramenta:slug]] que vira um card chamando a ferramenta do site.
 */
import { Marked, type Tokens } from "marked";
import { getService } from "./services";
import { slugify } from "./blog-shared";

export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toolCard(slug: string): string {
  const s = getService(slug);
  if (!s || s.status !== "live") return "";
  return `<a class="lv-tool-card" href="/ferramentas/${s.slug}"><span class="lv-tool-card__label">Ferramenta gratuita</span><strong>${escapeHtml(
    s.name,
  )}</strong><span>${escapeHtml(s.short)}</span><span class="lv-tool-card__cta">Usar agora →</span></a>`;
}

export function renderPost(markdown: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();

  const md = new Marked({ gfm: true, breaks: false });
  md.use({
    renderer: {
      heading(this: { parser: { parseInline: (t: Tokens.Generic[]) => string } }, { tokens, depth, text }: Tokens.Heading) {
        const inner = this.parser.parseInline(tokens);
        let id = slugify(text) || "secao";
        const n = used.get(id) ?? 0;
        used.set(id, n + 1);
        if (n) id = `${id}-${n + 1}`;
        if (depth === 2 || depth === 3) toc.push({ id, text: text.replace(/[*_`]/g, ""), depth });
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
      link({ href, title, tokens }: Tokens.Link) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const inner = (this as any).parser.parseInline(tokens);
        const external = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?lucavero\.com/i.test(href);
        const t = title ? ` title="${escapeHtml(title)}"` : "";
        const ext = external ? ` target="_blank" rel="noopener noreferrer"` : "";
        return `<a href="${escapeHtml(href)}"${t}${ext}>${inner}</a>`;
      },
      image({ href, title, text }: Tokens.Image) {
        const t = title ? ` title="${escapeHtml(title)}"` : "";
        const img = `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${t} loading="lazy" decoding="async" />`;
        return title
          ? `<figure>${img}<figcaption>${escapeHtml(title)}</figcaption></figure>`
          : img;
      },
    },
  });

  // Atalho de ferramenta numa linha própria: [[ferramenta:salario-liquido]]
  const source = (markdown || "").replace(
    /^\s*\[\[ferramenta:([a-z0-9-]+)\]\]\s*$/gm,
    (_m, slug: string) => `\n${toolCard(slug)}\n`,
  );

  const html = md.parse(source) as string;
  return { html, toc };
}
