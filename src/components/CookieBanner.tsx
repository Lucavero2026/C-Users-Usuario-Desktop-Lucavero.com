"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "lv_cookie_consent";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* localStorage indisponível */
    }
  }, []);

  function decide(value: "all" | "essential") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="container-page card mx-auto flex max-w-3xl flex-col gap-3 p-4 shadow-xl sm:flex-row sm:items-center sm:gap-5">
        <p className="flex-1 text-sm text-muted">
          Usamos cookies para melhorar sua experiência e exibir anúncios. Ao
          continuar, você concorda com nossa{" "}
          <Link href="/cookies" className="font-medium text-brand underline">
            Política de Cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => decide("essential")}
            className="focus-ring rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
          >
            Só essenciais
          </button>
          <button
            onClick={() => decide("all")}
            className="focus-ring rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
