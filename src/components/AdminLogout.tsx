"use client";

import { useRouter } from "next/navigation";

export function AdminLogout() {
  const router = useRouter();
  async function sair() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }
  return (
    <button
      onClick={sair}
      className="focus-ring rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
    >
      Sair
    </button>
  );
}
