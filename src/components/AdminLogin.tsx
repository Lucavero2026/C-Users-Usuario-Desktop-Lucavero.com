"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErro(data.error || "Não foi possível entrar.");
        return;
      }
      router.refresh();
    } catch {
      setErro("Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center">
      <div className="card p-8">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold">Painel administrativo</h1>
        <p className="mt-1 text-sm text-muted">
          Acesso restrito. Informe a senha de administrador.
        </p>
        <form onSubmit={entrar} className="mt-6 space-y-4">
          <Field label="Senha">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Entrando…" : "Entrar"}
          </Button>
          {erro && <p className="text-sm text-rose-600">{erro}</p>}
        </form>
      </div>
    </div>
  );
}
