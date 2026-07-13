import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Condições de uso do Lucavero Multiserviços.",
  alternates: { canonical: "/termos" },
};

export default function TermosPage() {
  return (
    <Prose title="Termos de Uso" updated="12 de julho de 2026">
      <p>
        Ao acessar e usar o <strong>{SITE.name}</strong> ({SITE.domain}), você
        concorda com estes Termos. Se não concordar, não utilize o site.
      </p>

      <h2>1. O serviço</h2>
      <p>
        O {SITE.name} oferece ferramentas online gratuitas de utilidade prática
        (calculadoras, geradores, consultas e afins), mantidas por {SITE.owner}{" "}
        (CNPJ {SITE.cnpj}).
      </p>

      <h2>2. Caráter informativo</h2>
      <p>
        Todo o conteúdo e resultados têm finalidade informativa e educativa. São
        <strong> estimativas</strong> baseadas em fórmulas e dados públicos e{" "}
        <strong>não constituem</strong> aconselhamento jurídico, contábil,
        financeiro ou profissional. Decisões tomadas com base nas ferramentas são
        de sua exclusiva responsabilidade.
      </p>

      <h2>3. Uso adequado</h2>
      <ul>
        <li>Não utilize o site para fins ilícitos ou fraudulentos.</li>
        <li>
          Ferramentas para desenvolvedores (como geração de CPF/CNPJ) destinam-se
          a testes de sistemas; não as use para simular identidades reais ou
          fraudar terceiros.
        </li>
        <li>Não tente sobrecarregar, invadir ou comprometer a infraestrutura.</li>
      </ul>

      <h2>4. Disponibilidade</h2>
      <p>
        O serviço é fornecido &ldquo;no estado em que se encontra&rdquo;. Algumas
        ferramentas dependem de APIs públicas de terceiros e podem ficar
        temporariamente indisponíveis. Não garantimos funcionamento ininterrupto
        nem exatidão absoluta dos resultados.
      </p>

      <h2>5. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei, {SITE.owner} não se responsabiliza
        por perdas ou danos decorrentes do uso ou da impossibilidade de uso do
        site ou de suas ferramentas.
      </p>

      <h2>6. Propriedade intelectual</h2>
      <p>
        A marca, o layout e o código do {SITE.name} são protegidos. Os documentos
        que você gera com nossas ferramentas são seus e você pode usá-los
        livremente.
      </p>

      <h2>7. Publicidade</h2>
      <p>
        O site é gratuito e sustentado por anúncios. Não nos responsabilizamos pelo
        conteúdo de sites de terceiros anunciados ou vinculados.
      </p>

      <h2>8. Alterações e foro</h2>
      <p>
        Podemos alterar estes Termos a qualquer momento. Aplica-se a legislação
        brasileira, ficando eleito o foro do domicílio do consumidor para dirimir
        controvérsias.
      </p>

      <h2>9. Contato</h2>
      <p>
        Dúvidas sobre estes Termos:{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </Prose>
  );
}
