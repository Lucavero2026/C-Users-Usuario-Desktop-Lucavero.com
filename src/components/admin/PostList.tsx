"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Search } from "lucide-react";
import { getBlogCategory, type PostState } from "@/lib/blog-shared";
import { normalize } from "@/lib/services";
import { StateBadge } from "./PostEditor";

export interface PostRow {
  slug: string;
  title: string;
  emoji: string;
  category: string;
  date: string;
  state: PostState;
  words: number;
}

const FILTERS: { id: "todos" | PostState; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "publicado", label: "Publicados" },
  { id: "agendado", label: "Agendados" },
  { id: "rascunho", label: "Rascunhos" },
];

export function PostList({ rows }: { rows: PostRow[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("todos");
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter === "todos" || r.state === filter) &&
          (!q || normalize(r.title).includes(normalize(q))),
      ),
    [rows, filter, q],
  );

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        {FILTERS.map((f) => {
          const n = f.id === "todos" ? rows.length : rows.filter((r) => r.state === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                filter === f.id ? "bg-brand text-white" : "text-muted hover:bg-surface-muted"
              }`}
            >
              {f.label} <span className="opacity-70">{n}</span>
            </button>
          );
        })}
        <label className="ml-auto flex items-center gap-2 rounded-full border border-border px-3 py-1">
          <Search className="h-4 w-4 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar artigo"
            className="w-40 bg-transparent text-sm outline-none"
          />
        </label>
      </div>
      <ul className="divide-y divide-border">
        {list.map((r) => (
          <li key={r.slug} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
            <span className="text-2xl">{r.emoji}</span>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/blog/${r.slug}`} className="font-semibold hover:text-brand">
                {r.title}
              </Link>
              <p className="text-xs text-muted">
                {getBlogCategory(r.category)?.name} ·{" "}
                {new Date(r.date).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                  dateStyle: "short",
                  timeStyle: "short",
                })}{" "}
                · {r.words} palavras
              </p>
            </div>
            <StateBadge state={r.state} date={r.date} />
            <div className="flex gap-1">
              <Link
                href={`/admin/blog/${r.slug}`}
                title="Editar"
                className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-brand"
              >
                <Pencil className="h-4 w-4" />
              </Link>
              {r.state === "publicado" && (
                <a
                  href={`/blog/${r.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver no site"
                  className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-brand"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="p-6 text-center text-sm text-muted">Nenhum artigo aqui.</li>}
      </ul>
    </div>
  );
}
