import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { CATEGORIES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { Logo } from "./Logo";

const LEGAL = [
  { href: "/sobre", label: "Sobre" },
  { href: "/programas-sociais", label: "Programas sociais" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "/termos", label: "Termos de Uso" },
  { href: "/cookies", label: "Política de Cookies" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface-muted">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            Um hub de serviços inteligentes para o dia a dia: finanças, documentos,
            trabalho, consultas e direitos — de graça e sem complicação.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li>
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-brand"
              >
                <MessageCircle className="h-4 w-4" /> {SITE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={`tel:+${SITE.phone}`}
                className="inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-brand"
              >
                <Phone className="h-4 w-4" /> {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 break-all text-foreground/80 transition-colors hover:text-brand"
              >
                <Mail className="h-4 w-4" /> {SITE.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Áreas
          </h3>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categoria/${c.id}`}
                  className="text-foreground/80 transition-colors hover:text-brand"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
            Institucional
          </h3>
          <ul className="space-y-2 text-sm">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-foreground/80 transition-colors hover:text-brand"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted md:flex-row">
          <p>
            © {new Date().getFullYear()} Lucavero Multiserviços — RCO COMUNICAÇÕES LTDA.
          </p>
          <p>
            Ferramentas informativas. Não substituem orientação profissional
            (jurídica, contábil ou financeira).
          </p>
        </div>
      </div>
    </footer>
  );
}
