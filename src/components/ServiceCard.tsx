import Link from "next/link";
import { ServiceIcon } from "./ServiceIcon";
import { getCategory, type Service } from "@/lib/services";

export function ServiceCard({ service }: { service: Service }) {
  const cat = getCategory(service.category);
  const soon = service.status === "soon";

  const inner = (
    <div
      className="card group relative flex h-full flex-col gap-3 p-5 transition-all"
      style={{ boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: cat.colorSoft, color: cat.color }}
        >
          <ServiceIcon name={service.icon} className="h-5 w-5" />
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {service.ai && (
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-brand">
              IA
            </span>
          )}
          {soon && (
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-muted">
              Em breve
            </span>
          )}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold leading-snug text-foreground">
          {service.name}
        </h3>
        <p className="mt-1 text-sm text-muted">{service.short}</p>
      </div>

      <div
        className="text-sm font-medium"
        style={{ color: soon ? "var(--muted)" : cat.color }}
      >
        {soon ? "Chegando em breve" : "Abrir ferramenta →"}
      </div>
    </div>
  );

  if (soon) {
    return <div className="opacity-80">{inner}</div>;
  }

  return (
    <Link
      href={`/ferramentas/${service.slug}`}
      className="focus-ring block rounded-2xl transition-transform hover:-translate-y-0.5"
    >
      {inner}
    </Link>
  );
}
