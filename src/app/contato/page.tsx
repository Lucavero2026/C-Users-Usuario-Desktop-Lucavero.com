import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { ContatoForm } from "@/components/ContatoForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a equipe do Lucavero Multiserviços: sugestões, dúvidas e correções.",
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">Contato</h1>
      <p className="mt-2 text-muted">
        Tem uma sugestão de ferramenta, encontrou um erro ou quer falar com a
        gente? Preencha o formulário abaixo.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_260px]">
        <div className="card p-6">
          <ContatoForm />
        </div>
        <aside className="space-y-4">
          <div className="card p-5">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">E-mail</p>
            <a
              href={`mailto:${SITE.email}`}
              className="break-all text-sm text-brand hover:underline"
            >
              {SITE.email}
            </a>
          </div>

          <div className="card p-5">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#128C7E]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">WhatsApp / Celular</p>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand hover:underline"
            >
              {SITE.whatsappDisplay}
            </a>
          </div>

          <div className="card p-5">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Phone className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">Telefone fixo</p>
            <a
              href={`tel:+${SITE.phone}`}
              className="text-sm text-brand hover:underline"
            >
              {SITE.phoneDisplay}
            </a>
          </div>

          <div className="card p-5 text-sm text-muted">
            <p className="font-medium text-foreground">{SITE.owner}</p>
            <p className="mt-1">CNPJ {SITE.cnpj}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
