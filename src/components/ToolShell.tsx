import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategory, type Service } from "@/lib/services";
import { ServiceIcon } from "./ServiceIcon";

/** Moldura padrão de uma página de ferramenta: cabeçalho, breadcrumb e conteúdo. */
export function ToolShell({
  service,
  children,
}: {
  service: Service;
  children: React.ReactNode;
}) {
  const cat = getCategory(service.category);
  return (
    <div className="container-page py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-brand">
          Início
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/categoria/${cat.id}`} className="hover:text-brand">
          {cat.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{service.name}</span>
      </nav>

      {/* Cabeçalho */}
      <header className="mb-8 flex items-start gap-4">
        <span
          className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: cat.colorSoft, color: cat.color }}
        >
          <ServiceIcon name={service.icon} className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {service.name}
          </h1>
          <p className="mt-1 max-w-2xl text-muted">{service.description}</p>
        </div>
      </header>

      <div className="min-w-0">{children}</div>

      <p className="mt-10 border-t border-border pt-4 text-xs text-muted">
        Esta ferramenta é informativa e usa fórmulas e dados públicos. Os
        resultados são estimativas e não substituem orientação profissional.
      </p>
    </div>
  );
}
