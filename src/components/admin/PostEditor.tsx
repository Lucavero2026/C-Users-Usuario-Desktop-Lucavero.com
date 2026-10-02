"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bold,
  CalendarClock,
  Check,
  ChevronLeft,
  ExternalLink,
  Eye,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Lightbulb,
  Link2,
  List,
  ListOrdered,
  Loader2,
  PenLine,
  Plus,
  Quote,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  BLOG_CATEGORIES,
  emptyPost,
  fromLocalInput,
  postState,
  readingMinutes,
  slugify,
  toLocalInput,
  wordCount,
  type FaqItem,
  type Post,
} from "@/lib/blog-shared";
import { renderPost } from "@/lib/blog-render";
import { LIVE_SERVICES, normalize } from "@/lib/services";

type Mode = "github" | "local" | "readonly";

const EMOJIS = ["💰", "📊", "💳", "🏦", "📈", "🧾", "🏠", "🚗", "💼", "🧮", "📅", "⚖️", "🤝", "💡", "🛒", "🎯"];

function nowLocal(): string {
  return toLocalInput(new Date().toISOString());
}

// ---------------------------------------------------------------------------
// Compressão de imagem no navegador (máx. 1600px, WEBP) antes do envio
// ---------------------------------------------------------------------------

async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif" || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

// ---------------------------------------------------------------------------
// Checklist de SEO
// ---------------------------------------------------------------------------

interface Check {
  ok: boolean;
  label: string;
  tip?: string;
}

function seoChecks(p: Post): Check[] {
  const title = p.seoTitle || p.title;
  const kw = normalize(p.keyword || "");
  const has = (text: string) => !!kw && normalize(text).includes(kw);
  const firstParagraph = p.body.split(/\n\s*\n/).find((b) => b.trim() && !b.trim().startsWith("#")) || "";
  const words = wordCount(p.body);
  const h2 = (p.body.match(/^##\s/gm) || []).length;
  const toolLinks = /\/ferramentas\/|\[\[ferramenta:/.test(p.body);
  return [
    {
      ok: title.length >= 30 && title.length <= 60,
      label: `Título com 30 a 60 caracteres (${title.length})`,
      tip: "Títulos maiores são cortados no Google.",
    },
    {
      ok: p.description.length >= 120 && p.description.length <= 160,
      label: `Descrição com 120 a 160 caracteres (${p.description.length})`,
      tip: "É o texto que aparece abaixo do título no Google.",
    },
    { ok: !!kw, label: "Palavra-chave principal definida", tip: "O termo que as pessoas pesquisam." },
    { ok: has(title), label: "Palavra-chave no título" },
    { ok: has(p.description), label: "Palavra-chave na descrição" },
    { ok: has(firstParagraph), label: "Palavra-chave no primeiro parágrafo" },
    { ok: !!kw && p.slug.includes(slugify(p.keyword || "")), label: "Palavra-chave no endereço (slug)" },
    {
      ok: words >= 600,
      label: `Texto com 600+ palavras (${words})`,
      tip: "Artigos completos tendem a ranquear melhor.",
    },
    { ok: h2 >= 2, label: `Pelo menos 2 subtítulos H2 (${h2})` },
    { ok: toolLinks, label: "Link para uma ferramenta do site", tip: "Use o botão “Ferramenta” da barra." },
    { ok: !!p.cover && !!p.coverAlt, label: "Imagem de capa com texto alternativo" },
    { ok: p.related.length > 0, label: "Ferramentas relacionadas marcadas" },
    { ok: p.faq.length >= 2, label: "Perguntas frequentes (2+)", tip: "Podem aparecer como destaque no Google." },
  ];
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

export function PostEditor({
  initial,
  isNew,
  mode,
  justSaved,
}: {
  initial: Post;
  isNew: boolean;
  mode: Mode;
  /** veio de um salvamento que mudou o endereço (novo artigo ou slug alterado) */
  justSaved?: boolean;
}) {
  const router = useRouter();
  const [post, setPost] = useState<Post>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tab, setTab] = useState<"escrever" | "visualizar">("escrever");
  const [saving, setSaving] = useState<null | "rascunho" | "publicar">(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(
    justSaved
      ? {
          ok: true,
          text:
            "Salvo!" + (mode === "github" ? " O site atualiza em cerca de 1 a 2 minutos." : ""),
        }
      : null,
  );
  const [uploading, setUploading] = useState(false);
  const [toolQuery, setToolQuery] = useState("");
  const [markUpdated, setMarkUpdated] = useState(false);
  const [restore, setRestore] = useState<Post | null>(null);
  const [dirty, setDirty] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  /** imagens enviadas nesta sessão: URL final → prévia local (o site só as
   * publica após o próximo deploy) */
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const draftKey = `lv-blog-draft:${initial.slug || "novo"}`;

  function update<K extends keyof Post>(key: K, value: Post[K]) {
    setPost((p) => {
      const next = { ...p, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    setDirty(true);
  }

  // Rascunho automático no navegador (protege contra fechar a aba sem salvar).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw) as Post;
        // Leitura do armazenamento do navegador só existe após montar o componente.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (saved.body !== initial.body || saved.title !== initial.title) setRestore(saved);
      }
    } catch {
      /* sem armazenamento local */
    }
  }, [draftKey, initial.body, initial.title]);

  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(post));
      } catch {
        /* ignore */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [post, dirty, draftKey]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // ----- Inserção de Markdown na posição do cursor -----

  function wrap(before: string, after = before, placeholder = "texto") {
    const ta = bodyRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    update("body", next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  }

  function linePrefix(prefix: string) {
    const ta = bodyRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const start = value.lastIndexOf("\n", s - 1) + 1;
    const block = value.slice(start, e) || "texto";
    const lines = block
      .split("\n")
      .map((l, i) => (prefix === "1. " ? `${i + 1}. ` : prefix) + l.replace(/^(#{1,6}\s|[-*]\s|\d+\.\s|>\s)/, ""))
      .join("\n");
    update("body", value.slice(0, start) + lines + value.slice(e));
    requestAnimationFrame(() => ta.focus());
  }

  function insertBlock(text: string) {
    const ta = bodyRef.current;
    const value = post.body;
    const pos = ta ? ta.selectionEnd : value.length;
    const before = value.slice(0, pos);
    const sep = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    update("body", before + sep + text + "\n\n" + value.slice(pos).replace(/^\n+/, ""));
    requestAnimationFrame(() => ta?.focus());
  }

  function insertLink() {
    const url = window.prompt("Endereço do link (ex.: https://... ou /ferramentas/salario-liquido):");
    if (url) wrap("[", `](${url})`, "texto do link");
  }

  async function upload(file: File): Promise<string | null> {
    setUploading(true);
    setMsg(null);
    try {
      const small = await compressImage(file);
      const form = new FormData();
      form.append("file", small);
      const r = await fetch("/api/admin/blog/upload", { method: "POST", body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Falha no envio.");
      setPreviews((p) => ({ ...p, [data.url]: URL.createObjectURL(small) }));
      return data.url as string;
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Falha no envio da imagem." });
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function insertImage(file: File) {
    const url = await upload(file);
    if (!url) return;
    const alt = window.prompt("Descreva a imagem (texto alternativo, ajuda no SEO):", "") || "";
    insertBlock(`![${alt}](${url})`);
  }

  // ----- Salvar -----

  // Relógio para saber se a data escolhida é futura (agendamento).
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const state = postState(post, now);
  const future = new Date(post.date).getTime() > now;

  async function save(kind: "rascunho" | "publicar") {
    setSaving(kind);
    setMsg(null);
    const payload: Post = {
      ...post,
      status: kind === "rascunho" ? "rascunho" : "publicado",
      updated: markUpdated ? new Date().toISOString() : post.updated,
    };
    try {
      const r = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: payload, previousSlug: isNew ? undefined : initial.slug }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Não foi possível salvar.");
      setPost(payload);
      setDirty(false);
      setMarkUpdated(false);
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      const quando =
        kind === "rascunho"
          ? "Rascunho salvo (não aparece no site)."
          : future
            ? "Agendado! O artigo aparece no site na data marcada."
            : "Publicado!";
      const deploy = data.mode === "github" ? " O site atualiza em cerca de 1 a 2 minutos." : "";
      setMsg({ ok: true, text: quando + deploy });
      if (isNew || data.slug !== initial.slug) {
        router.replace(`/admin/blog/${data.slug}?salvo=1`);
      } else {
        router.refresh();
      }
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Erro ao salvar." });
    } finally {
      setSaving(null);
    }
  }

  async function remove() {
    if (!window.confirm(`Excluir definitivamente o artigo “${post.title}”?`)) return;
    const r = await fetch(`/api/admin/blog?slug=${encodeURIComponent(initial.slug)}`, { method: "DELETE" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      setMsg({ ok: false, text: data.error || "Não foi possível excluir." });
      return;
    }
    setDirty(false);
    router.push("/admin/blog?excluido=1");
  }

  // ----- Derivados -----

  const preview = useMemo(() => {
    if (tab !== "visualizar") return "";
    let html = renderPost(post.body).html;
    for (const [url, local] of Object.entries(previews)) html = html.split(url).join(local);
    return html;
  }, [tab, post.body, previews]);

  const checks = useMemo(() => seoChecks(post), [post]);
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  const scoreColor = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500";
  const tools = LIVE_SERVICES.filter(
    (s) => !toolQuery || normalize(s.name).includes(normalize(toolQuery)),
  );
  const coverSrc = post.cover ? previews[post.cover] || post.cover : "";
  const words = wordCount(post.body);

  return (
    <div className="pb-24">
      {/* Barra superior */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/blog" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
          <ChevronLeft className="h-4 w-4" /> Todos os artigos
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <StateBadge state={state} date={post.date} />
          {!isNew && state === "publicado" && (
            <a
              href={`/blog/${initial.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 font-medium hover:border-brand hover:text-brand"
            >
              Ver no site <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {mode === "readonly" && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <strong>Publicação ainda não configurada.</strong> Para salvar artigos pelo site, defina as
          variáveis <code>GITHUB_TOKEN</code> e <code>GITHUB_REPO</code> na Vercel (veja o guia em{" "}
          <Link href="/admin/blog" className="underline">/admin/blog</Link>).
        </div>
      )}

      {restore && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-300 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
          Encontramos alterações não salvas deste artigo no seu navegador.
          <div className="flex gap-2">
            <button
              className="rounded-full bg-sky-600 px-3 py-1 font-semibold text-white"
              onClick={() => {
                setPost(restore);
                setRestore(null);
                setDirty(true);
              }}
            >
              Recuperar
            </button>
            <button
              className="rounded-full border border-sky-400 px-3 py-1"
              onClick={() => {
                localStorage.removeItem(draftKey);
                setRestore(null);
              }}
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ------------------------- Coluna principal ------------------------- */}
        <div className="min-w-0 space-y-5">
          <textarea
            value={post.title}
            onChange={(e) => update("title", e.target.value.replace(/\n/g, " "))}
            placeholder="Título do artigo"
            rows={1}
            className="w-full resize-none border-0 bg-transparent text-3xl font-extrabold tracking-tight outline-none [field-sizing:content] placeholder:text-muted/50"
          />

          <div className="flex flex-wrap items-center gap-1 text-sm text-muted">
            <span>lucavero.com/blog/</span>
            <input
              value={post.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", slugify(e.target.value) || e.target.value.toLowerCase());
              }}
              className="min-w-40 flex-1 rounded-md border border-transparent bg-surface-muted px-2 py-0.5 font-mono text-xs outline-none focus:border-brand"
              placeholder="endereco-do-artigo"
            />
          </div>

          <label className="block">
            <span className="mb-1 flex justify-between text-sm font-medium">
              Resumo / descrição para o Google
              <Counter value={post.description.length} min={120} max={160} />
            </span>
            <textarea
              value={post.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              placeholder="Uma ou duas frases que convençam a pessoa a clicar. Aparece no Google e nos cards do blog."
              className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 outline-none focus:border-brand"
            />
          </label>

          {/* Editor de texto */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-muted px-2 py-1.5">
              <div className="mr-2 flex rounded-lg bg-surface p-0.5 text-xs font-semibold">
                <TabBtn active={tab === "escrever"} onClick={() => setTab("escrever")}>
                  <PenLine className="h-3.5 w-3.5" /> Escrever
                </TabBtn>
                <TabBtn active={tab === "visualizar"} onClick={() => setTab("visualizar")}>
                  <Eye className="h-3.5 w-3.5" /> Visualizar
                </TabBtn>
              </div>
              {tab === "escrever" && (
                <>
                  <Tool title="Subtítulo (H2)" onClick={() => linePrefix("## ")}><Heading2 className="h-4 w-4" /></Tool>
                  <Tool title="Subtítulo menor (H3)" onClick={() => linePrefix("### ")}><Heading3 className="h-4 w-4" /></Tool>
                  <Tool title="Negrito" onClick={() => wrap("**")}><Bold className="h-4 w-4" /></Tool>
                  <Tool title="Itálico" onClick={() => wrap("*")}><Italic className="h-4 w-4" /></Tool>
                  <Tool title="Lista" onClick={() => linePrefix("- ")}><List className="h-4 w-4" /></Tool>
                  <Tool title="Lista numerada" onClick={() => linePrefix("1. ")}><ListOrdered className="h-4 w-4" /></Tool>
                  <Tool title="Citação" onClick={() => linePrefix("> ")}><Quote className="h-4 w-4" /></Tool>
                  <Tool title="Caixa de dica" onClick={() => insertBlock("> 💡 **Dica:** escreva aqui a sua dica.")}><Lightbulb className="h-4 w-4" /></Tool>
                  <Tool title="Link" onClick={insertLink}><Link2 className="h-4 w-4" /></Tool>
                  <label title="Inserir imagem" className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) insertImage(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <select
                    title="Inserir card de ferramenta"
                    className="ml-1 h-8 max-w-44 rounded-md border border-border bg-surface px-2 text-xs"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) insertBlock(`[[ferramenta:${e.target.value}]]`);
                    }}
                  >
                    <option value="">🔧 Ferramenta…</option>
                    {LIVE_SERVICES.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <span className="ml-auto px-2 text-xs text-muted">
                {words} palavras · {readingMinutes(post.body)} min de leitura
              </span>
            </div>

            {tab === "escrever" ? (
              <textarea
                ref={bodyRef}
                value={post.body}
                onChange={(e) => update("body", e.target.value)}
                onPaste={(e) => {
                  const f = Array.from(e.clipboardData.files).find((x) => x.type.startsWith("image/"));
                  if (f) {
                    e.preventDefault();
                    insertImage(f);
                  }
                }}
                onDrop={(e) => {
                  const f = Array.from(e.dataTransfer.files).find((x) => x.type.startsWith("image/"));
                  if (f) {
                    e.preventDefault();
                    insertImage(f);
                  }
                }}
                placeholder={"Escreva o artigo aqui.\n\nUse ## para subtítulos, **negrito**, - para listas.\nCole ou arraste imagens direto no texto."}
                className="block min-h-[60vh] w-full resize-y bg-surface px-5 py-4 font-mono text-[0.92rem] leading-7 outline-none"
              />
            ) : (
              <div className="min-h-[60vh] px-6 py-5">
                {post.body.trim() ? (
                  <div className="prose-lv" dangerouslySetInnerHTML={{ __html: preview }} />
                ) : (
                  <p className="text-muted">Nada para visualizar ainda.</p>
                )}
              </div>
            )}
          </div>

          <details className="rounded-xl border border-border bg-surface-muted p-4 text-sm text-muted">
            <summary className="cursor-pointer font-medium text-foreground">Guia rápido de formatação</summary>
            <ul className="mt-2 space-y-1 font-mono text-xs">
              <li>## Subtítulo · ### Subtítulo menor</li>
              <li>**negrito** · *itálico* · [texto](https://link)</li>
              <li>- item de lista · 1. item numerado · &gt; citação</li>
              <li>[[ferramenta:salario-liquido]] → card que leva à ferramenta (sozinho na linha)</li>
              <li>| Coluna | Coluna | → tabela (linha seguinte: |---|---|)</li>
            </ul>
          </details>

          {/* FAQ */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Perguntas frequentes</h2>
                <p className="text-xs text-muted">
                  Aparecem no fim do artigo e podem virar destaque no Google.
                </p>
              </div>
              <button
                type="button"
                onClick={() => update("faq", [...post.faq, { q: "", a: "" }])}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-brand hover:text-brand"
              >
                <Plus className="h-3.5 w-3.5" /> Pergunta
              </button>
            </div>
            <div className="space-y-3">
              {post.faq.map((f, i) => (
                <div key={i} className="rounded-xl border border-border p-3">
                  <div className="flex gap-2">
                    <input
                      value={f.q}
                      placeholder="Pergunta"
                      onChange={(e) => update("faq", post.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))}
                      className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      title="Remover"
                      onClick={() => update("faq", post.faq.filter((_, j) => j !== i) as FaqItem[])}
                      className="rounded-lg px-2 text-muted hover:text-rose-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={f.a}
                    placeholder="Resposta"
                    rows={2}
                    onChange={(e) => update("faq", post.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))}
                    className="mt-2 w-full resize-y rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-brand"
                  />
                </div>
              ))}
              {post.faq.length === 0 && <p className="text-sm text-muted">Nenhuma pergunta ainda.</p>}
            </div>
          </section>
        </div>

        {/* ----------------------------- Lateral ----------------------------- */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          {/* Publicação */}
          <Panel title="Publicação">
            <label className="block text-sm">
              <span className="mb-1 flex items-center gap-1 font-medium">
                <CalendarClock className="h-4 w-4" /> Data e hora (Brasília)
              </span>
              <input
                type="datetime-local"
                value={toLocalInput(post.date)}
                onChange={(e) => update("date", fromLocalInput(e.target.value))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-brand"
              />
            </label>
            <div className="flex gap-2 text-xs">
              <button type="button" className="text-brand hover:underline" onClick={() => update("date", fromLocalInput(nowLocal()))}>
                Agora
              </button>
              <span className="text-muted">·</span>
              <button
                type="button"
                className="text-brand hover:underline"
                onClick={() => {
                  const d = new Date(Date.now() + 86400000 - 3 * 3600_000);
                  update("date", fromLocalInput(d.toISOString().slice(0, 10) + "T08:00"));
                }}
              >
                Amanhã às 8h
              </button>
            </div>
            {future && (
              <p className="rounded-lg bg-sky-50 p-2 text-xs text-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
                Data futura: o artigo fica agendado e aparece sozinho no site nesse horário (em até 1 hora).
              </p>
            )}
            {!isNew && (
              <label className="flex items-center gap-2 text-xs text-muted">
                <input type="checkbox" checked={markUpdated} onChange={(e) => setMarkUpdated(e.target.checked)} />
                Marcar como “atualizado hoje” (bom para SEO em revisões)
              </label>
            )}
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={!!post.featured} onChange={(e) => update("featured", e.target.checked)} />
              Destacar no topo do blog
            </label>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                disabled={!!saving || mode === "readonly"}
                onClick={() => save("publicar")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {saving === "publicar" ? <Loader2 className="h-4 w-4 animate-spin" /> : future ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {future ? "Agendar publicação" : state === "publicado" ? "Atualizar artigo" : "Publicar agora"}
              </button>
              <button
                type="button"
                disabled={!!saving || mode === "readonly"}
                onClick={() => save("rascunho")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-muted disabled:opacity-50"
              >
                {saving === "rascunho" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {state === "rascunho" ? "Salvar rascunho" : "Despublicar (virar rascunho)"}
              </button>
            </div>
            {msg && (
              <p className={`rounded-lg p-2.5 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"}`}>
                {msg.text}
              </p>
            )}
            {dirty && !msg && <p className="text-xs text-amber-600">Alterações não salvas.</p>}
            {!isNew && (
              <button type="button" onClick={remove} className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline">
                <Trash2 className="h-3.5 w-3.5" /> Excluir artigo
              </button>
            )}
          </Panel>

          {/* SEO */}
          <Panel title={`SEO · ${score}%`}>
            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
              <div className={`h-full ${scoreColor} transition-all`} style={{ width: `${score}%` }} />
            </div>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Palavra-chave principal</span>
              <input
                value={post.keyword || ""}
                onChange={(e) => update("keyword", e.target.value)}
                placeholder="Ex.: salário líquido 2026"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-brand"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 flex justify-between font-medium">
                Título no Google (opcional)
                <Counter value={(post.seoTitle || "").length} min={30} max={60} />
              </span>
              <input
                value={post.seoTitle || ""}
                onChange={(e) => update("seoTitle", e.target.value)}
                placeholder={post.title || "Usa o título do artigo"}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-brand"
              />
            </label>

            {/* Prévia do Google */}
            <div className="rounded-xl border border-border bg-white p-3 text-left dark:bg-zinc-900">
              <p className="truncate text-xs text-emerald-800 dark:text-emerald-400">lucavero.com › blog › {post.slug || "…"}</p>
              <p className="line-clamp-2 text-[1.05rem] leading-snug text-[#1a0dab] dark:text-sky-400">
                {(post.seoTitle || post.title || "Título do artigo") + " | Lucavero"}
              </p>
              <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                {post.description || "A descrição do artigo aparece aqui."}
              </p>
            </div>

            <ul className="space-y-1.5 text-xs">
              {checks.map((c) => (
                <li key={c.label} className="flex gap-2" title={c.tip}>
                  <span className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${c.ok ? "bg-emerald-500 text-white" : "border border-border"}`}>
                    {c.ok && <Check className="h-3 w-3" />}
                  </span>
                  <span className={c.ok ? "text-muted line-through decoration-muted/40" : ""}>{c.label}</span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Organização */}
          <Panel title="Organização">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Categoria</span>
              <select
                value={post.category}
                onChange={(e) => update("category", e.target.value as Post["category"])}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2"
              >
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Tags (separadas por vírgula)</span>
              <input
                value={post.tags.join(", ")}
                onChange={(e) => update("tags", e.target.value.split(",").map((t) => t.trimStart()))}
                onBlur={() => update("tags", post.tags.map((t) => t.trim()).filter(Boolean))}
                placeholder="imposto de renda, clt, 2026"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 outline-none focus:border-brand"
              />
            </label>
            <div className="text-sm">
              <span className="mb-1 block font-medium">Ícone do card</span>
              <div className="flex flex-wrap gap-1">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => update("emoji", em)}
                    className={`h-8 w-8 rounded-lg text-lg ${post.emoji === em ? "bg-brand-soft ring-2 ring-brand" : "hover:bg-surface-muted"}`}
                  >
                    {em}
                  </button>
                ))}
                <input
                  value={post.emoji}
                  onChange={(e) => update("emoji", e.target.value)}
                  className="h-8 w-12 rounded-lg border border-border bg-surface text-center"
                  title="Ou cole outro emoji"
                />
              </div>
            </div>
          </Panel>

          {/* Capa */}
          <Panel title="Imagem de capa">
            {coverSrc ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverSrc} alt={post.coverAlt || ""} className="aspect-[1200/630] w-full rounded-lg object-cover" />
                <button type="button" onClick={() => update("cover", undefined)} className="text-xs text-rose-600 hover:underline">
                  Remover capa
                </button>
              </div>
            ) : (
              <label className="flex aspect-[1200/630] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-sm text-muted hover:border-brand hover:text-brand">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                Enviar imagem (ideal 1200×630)
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) {
                      const url = await upload(f);
                      if (url) update("cover", url);
                    }
                  }}
                />
              </label>
            )}
            <input
              value={post.coverAlt || ""}
              onChange={(e) => update("coverAlt", e.target.value)}
              placeholder="Descrição da imagem (texto alternativo)"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <p className="text-xs text-muted">Sem capa, o site gera automaticamente uma imagem com o título para as redes sociais.</p>
          </Panel>

          {/* Ferramentas relacionadas */}
          <Panel title={`Ferramentas relacionadas (${post.related.length})`}>
            <p className="text-xs text-muted">
              Aparecem como atalhos no fim do artigo, e o artigo aparece na página da ferramenta.
            </p>
            <input
              value={toolQuery}
              onChange={(e) => setToolQuery(e.target.value)}
              placeholder="Filtrar ferramentas…"
              className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-brand"
            />
            <div className="max-h-56 space-y-1 overflow-y-auto pr-1 text-sm">
              {tools.map((s) => (
                <label key={s.slug} className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-surface-muted">
                  <input
                    type="checkbox"
                    checked={post.related.includes(s.slug)}
                    onChange={(e) =>
                      update(
                        "related",
                        e.target.checked ? [...post.related, s.slug] : post.related.filter((x) => x !== s.slug),
                      )
                    }
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pequenos componentes
// ---------------------------------------------------------------------------

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Tool({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground"
    >
      {children}
    </button>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 ${active ? "bg-brand text-white" : "text-muted hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

function Counter({ value, min, max }: { value: number; min: number; max: number }) {
  const color = value === 0 ? "text-muted" : value < min || value > max ? "text-amber-600" : "text-emerald-600";
  return (
    <span className={`text-xs font-normal ${color}`}>
      {value}/{max}
    </span>
  );
}

export function StateBadge({ state, date }: { state: "publicado" | "agendado" | "rascunho"; date: string }) {
  const map = {
    publicado: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    agendado: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    rascunho: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  }[state];
  const label =
    state === "agendado"
      ? `Agendado · ${new Date(date).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
      : state === "publicado"
        ? "Publicado"
        : "Rascunho";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${map}`}>{label}</span>;
}
