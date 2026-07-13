import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça o Lucavero Multiserviços: um hub de ferramentas inteligentes e gratuitas para o dia a dia.",
  alternates: { canonical: "/sobre" },
};

export default function SobrePage() {
  return (
    <Prose title="Sobre o Lucavero Multiserviços">
      <p>
        O <strong>{SITE.name}</strong> é um hub de serviços digitais criado para
        resolver, em um só lugar, as pequenas burocracias e cálculos do dia a dia
        — de forma rápida, gratuita e sem cadastro.
      </p>
      <p>
        Reunimos mais de {SERVICES.length} ferramentas nas áreas de finanças
        pessoais, trabalho, documentos, consultas públicas, utilidades e direitos.
        Nosso objetivo é simples: transformar tarefas confusas em algo que você
        resolve em segundos, com uma interface limpa e ajuda de inteligência
        artificial.
      </p>

      <h2>Nossa proposta</h2>
      <ul>
        <li>Acesso 100% gratuito, sem necessidade de conta.</li>
        <li>Ferramentas objetivas, sem passos desnecessários.</li>
        <li>Privacidade: cálculos feitos no seu navegador sempre que possível.</li>
        <li>Conteúdo em português, pensado para a realidade brasileira.</li>
      </ul>

      <h2>Quem somos</h2>
      <p>
        O {SITE.name} é mantido por <strong>{SITE.owner}</strong>, inscrita no CNPJ{" "}
        {SITE.cnpj}. O site é sustentado por publicidade, exibida de forma discreta
        para não atrapalhar sua experiência.
      </p>

      <h2>Aviso importante</h2>
      <p>
        As ferramentas têm caráter informativo e educativo. Os resultados são
        estimativas baseadas em fórmulas e dados públicos e não substituem a
        orientação de um profissional habilitado (advogado, contador ou consultor
        financeiro). Confira sempre com um especialista antes de tomar decisões.
      </p>

      <h2>Fale com a gente</h2>
      <p>
        Sugestões de novas ferramentas, dúvidas ou correções são muito bem-vindas.
        Escreva para <a href={`mailto:${SITE.email}`}>{SITE.email}</a> ou use nossa{" "}
        <a href="/contato">página de contato</a>.
      </p>
    </Prose>
  );
}
