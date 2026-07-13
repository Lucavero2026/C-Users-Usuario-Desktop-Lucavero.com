import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CATEGORIES, SERVICES } from "@/lib/services";
import { POSTS } from "@/lib/blog";
import { ADMIN_COOKIE, adminEnabled, isValidToken } from "@/lib/admin";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminLogout } from "@/components/AdminLogout";
import { AI_MODEL } from "@/lib/ai";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Badge({ ok, on, off }: { ok: boolean; on: string; off: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        ok
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-500"}`} />
      {ok ? on : off}
    </span>
  );
}

export default async function AdminPage() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;

  if (!adminEnabled()) {
    return (
      <div className="container-page max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold">Painel não configurado</h1>
        <p className="mt-2 text-muted">
          Defina a variável de ambiente <code>ADMIN_PASSWORD</code> (no
          <code> .env.local</code> e na Vercel) para ativar o painel administrativo.
        </p>
      </div>
    );
  }

  if (!isValidToken(token)) {
    return (
      <div className="container-page">
        <AdminLogin />
      </div>
    );
  }

  const live = SERVICES.filter((s) => s.status === "live");
  const soon = SERVICES.filter((s) => s.status === "soon");
  const ai = SERVICES.filter((s) => s.ai);
  const aiOn = !!process.env.ANTHROPIC_API_KEY;
  const adsOn = !!process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <div className="container-page py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
          <p className="text-sm text-muted">Visão geral do Lucavero Multiserviços.</p>
        </div>
        <AdminLogout />
      </header>

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Ferramentas no ar" value={live.length} hint={`de ${SERVICES.length} no total`} />
        <Stat label="Em breve" value={soon.length} hint="a implementar" />
        <Stat label="Ferramentas com IA" value={ai.length} />
        <Stat label="Artigos no blog" value={POSTS.length} />
      </div>

      {/* Status do ambiente */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Integrações</h2>
        <div className="card divide-y divide-border">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Inteligência Artificial (Claude)</p>
              <p className="text-xs text-muted">Modelo: {AI_MODEL}</p>
            </div>
            <Badge ok={aiOn} on="Ativa" off="Sem chave" />
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Google AdSense</p>
              <p className="text-xs text-muted">Anúncios automáticos</p>
            </div>
            <Badge ok={adsOn} on="Configurado" off="Pendente" />
          </div>
        </div>
      </section>

      {/* Lista de ferramentas por status */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-bold">No ar ({live.length})</h2>
          <ul className="card divide-y divide-border text-sm">
            {live.map((s) => (
              <li key={s.slug} className="flex items-center justify-between p-3">
                <Link href={`/ferramentas/${s.slug}`} className="hover:text-brand">
                  {s.name}
                </Link>
                {s.ai && (
                  <span className="rounded bg-brand-soft px-1.5 text-[0.6rem] font-bold text-brand">
                    IA
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-bold">Em breve ({soon.length})</h2>
          <ul className="card divide-y divide-border text-sm">
            {soon.map((s) => (
              <li key={s.slug} className="flex items-center justify-between p-3 text-muted">
                {s.name}
                <span className="text-[0.6rem] font-semibold uppercase">pendente</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Blog */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Artigos ({POSTS.length})</h2>
        <ul className="card divide-y divide-border text-sm">
          {POSTS.map((p) => (
            <li key={p.slug} className="flex items-center justify-between p-3">
              <Link href={`/blog/${p.slug}`} className="hover:text-brand">
                {p.emoji} {p.title}
              </Link>
              <span className="text-xs text-muted">{p.tag}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-xs text-muted">
        Dica: para adicionar ferramentas ou artigos, edite <code>src/lib/services.ts</code>{" "}
        e <code>src/lib/blog.ts</code>. O painel é somente leitura.
      </p>
    </div>
  );
}
