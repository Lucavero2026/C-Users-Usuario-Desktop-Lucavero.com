import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { AdminGate } from "@/components/admin/AdminGate";
import { PostList, type PostRow } from "@/components/admin/PostList";
import { getAllPosts } from "@/lib/blog";
import { postState, wordCount } from "@/lib/blog-shared";
import { storeMode } from "@/lib/blog-store";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ excluido?: string }>;
}) {
  const { excluido } = await searchParams;
  return (
    <AdminGate>
      <BlogDashboard excluido={!!excluido} />
    </AdminGate>
  );
}

/** Momento da requisição (a página do painel é sempre dinâmica). */
function agora(): number {
  return Date.now();
}

function dayKey(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

async function BlogDashboard({ excluido }: { excluido: boolean }) {
  const posts = await getAllPosts();
  const mode = storeMode();
  const now = agora();
  const rows: PostRow[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    emoji: p.emoji,
    category: p.category,
    date: p.date,
    state: postState(p, now),
    words: wordCount(p.body),
  }));
  const count = (s: PostRow["state"]) => rows.filter((r) => r.state === s).length;

  // Calendário dos próximos 14 dias, para manter o ritmo de 1 artigo por dia.
  const byDay = new Map<string, PostRow[]>();
  for (const r of rows) {
    const k = dayKey(new Date(r.date));
    byDay.set(k, [...(byDay.get(k) || []), r]);
  }
  const days = Array.from({ length: 14 }, (_, i) => new Date(now + i * 86400000));

  return (
    <div className="container-page py-10">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
        <ChevronLeft className="h-4 w-4" /> Painel
      </Link>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-sm text-muted">Escreva, agende e publique artigos.</p>
        </div>
        <Link
          href="/admin/blog/novo"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> Novo artigo
        </Link>
      </header>

      {excluido && (
        <p className="mb-6 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          Artigo excluído.
          {mode === "github" && " A lista abaixo se atualiza após o próximo deploy (cerca de 1 a 2 minutos)."}
        </p>
      )}

      {mode === "readonly" && <SetupCard />}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Publicados" value={count("publicado")} />
        <Stat label="Agendados" value={count("agendado")} />
        <Stat label="Rascunhos" value={count("rascunho")} />
      </div>

      <section className="mb-8">
        <h2 className="mb-1 text-lg font-bold">Próximos 14 dias</h2>
        <p className="mb-3 text-xs text-muted">
          Verde: dia com artigo agendado ou publicado. 📝 em cinza: pauta ainda em rascunho.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-7">
          {days.map((d) => {
            const k = dayKey(d);
            const items = byDay.get(k) || [];
            return (
              <div
                key={k}
                className={`min-h-20 rounded-xl border p-2 text-xs ${
                  items.some((r) => r.state !== "rascunho")
                    ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30"
                    : "border-dashed border-border"
                }`}
              >
                <p className="font-semibold capitalize">
                  {d.toLocaleDateString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </p>
                {items.length ? (
                  items.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/admin/blog/${r.slug}`}
                      className={`mt-1 line-clamp-2 block hover:text-brand ${
                        r.state === "rascunho" ? "text-muted italic" : ""
                      }`}
                      title={r.state === "rascunho" ? "Pauta em rascunho" : "Agendado/publicado"}
                    >
                      {r.state === "rascunho" ? "📝" : r.emoji} {r.title}
                    </Link>
                  ))
                ) : (
                  <p className="mt-1 text-muted">Sem artigo</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <PostList rows={rows} />

      {mode === "github" && (
        <p className="mt-4 text-xs text-muted">
          Cada publicação grava no GitHub e a Vercel atualiza o site em cerca de 1 a 2 minutos. Um
          artigo recém-salvo pode levar esse tempo para aparecer nesta lista.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function SetupCard() {
  return (
    <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
      <h2 className="text-base font-bold">Ative a publicação pelo site (uma vez só, grátis)</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>
          No GitHub, abra <strong>Settings → Developer settings → Personal access tokens →
          Fine-grained tokens → Generate new token</strong>.
        </li>
        <li>
          Em <em>Repository access</em>, escolha só o repositório do site. Em{" "}
          <em>Permissions → Contents</em>, marque <strong>Read and write</strong>. Gere e copie o
          token.
        </li>
        <li>
          Na Vercel, em <strong>Settings → Environment Variables</strong>, crie{" "}
          <code>GITHUB_TOKEN</code> (o token) e <code>GITHUB_REPO</code> com o valor{" "}
          <code>Lucavero2026/C-Users-Usuario-Desktop-Lucavero.com</code>. Depois faça um{" "}
          <em>Redeploy</em>.
        </li>
      </ol>
    </div>
  );
}
