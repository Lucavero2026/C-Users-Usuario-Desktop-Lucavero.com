import Link from "next/link";
import { Logo } from "./Logo";
import { CATEGORIES } from "@/lib/services";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/categoria/${c.id}`}
              className="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/ferramentas"
            className="focus-ring rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Ver ferramentas
          </Link>
        </div>
      </div>
    </header>
  );
}
