import Link from "next/link";

/** Logotipo do Lucavero Multiserviços: marca com "hub" de serviços. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 focus-ring rounded-lg ${className}`}
      aria-label="Lucavero Multiserviços — página inicial"
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
          <defs>
            <linearGradient id="lv-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6366f1" />
              <stop offset="0.5" stopColor="#0284c7" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#lv-g)" />
          {/* nó central + raios (hub de serviços) */}
          <circle cx="20" cy="20" r="4.2" fill="#fff" />
          <circle cx="20" cy="9.5" r="2.4" fill="#fff" opacity="0.95" />
          <circle cx="20" cy="30.5" r="2.4" fill="#fff" opacity="0.95" />
          <circle cx="9.5" cy="20" r="2.4" fill="#fff" opacity="0.95" />
          <circle cx="30.5" cy="20" r="2.4" fill="#fff" opacity="0.95" />
          <g stroke="#fff" strokeWidth="1.6" opacity="0.8">
            <line x1="20" y1="15.8" x2="20" y2="11.9" />
            <line x1="20" y1="24.2" x2="20" y2="28.1" />
            <line x1="15.8" y1="20" x2="11.9" y2="20" />
            <line x1="24.2" y1="20" x2="28.1" y2="20" />
          </g>
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[1.05rem] font-bold tracking-tight text-foreground">
          Lucavero
        </span>
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Multiserviços
        </span>
      </span>
    </Link>
  );
}
