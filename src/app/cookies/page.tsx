import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Como o Lucavero Multiserviços usa cookies e como você pode gerenciá-los.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <Prose title="Política de Cookies" updated="12 de julho de 2026">
      <p>
        Cookies são pequenos arquivos que um site guarda no seu navegador. O{" "}
        <strong>{SITE.name}</strong> usa cookies para funcionar corretamente,
        entender o uso do site e exibir publicidade.
      </p>

      <h2>Tipos de cookies que usamos</h2>
      <ul>
        <li>
          <strong>Essenciais:</strong> necessários para o funcionamento básico,
          como lembrar sua escolha no aviso de cookies.
        </li>
        <li>
          <strong>De análise:</strong> ajudam a entender, de forma agregada e
          anônima, como o site é utilizado (ex.: Google Analytics).
        </li>
        <li>
          <strong>De publicidade:</strong> usados por parceiros como o Google
          AdSense para exibir anúncios mais relevantes.
        </li>
      </ul>

      <h2>Publicidade do Google</h2>
      <p>
        O Google e seus parceiros podem usar cookies para veicular anúncios com
        base nas suas visitas a este e a outros sites. Você pode gerenciar suas
        preferências nas{" "}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          Configurações de anúncios do Google
        </a>{" "}
        ou em{" "}
        <a
          href="https://www.aboutads.info"
          target="_blank"
          rel="noopener noreferrer"
        >
          aboutads.info
        </a>
        .
      </p>

      <h2>Como gerenciar cookies</h2>
      <p>
        Você pode aceitar ou recusar cookies não essenciais no aviso exibido ao
        entrar no site, e também apagar ou bloquear cookies nas configurações do
        seu navegador. Bloquear alguns cookies pode afetar o funcionamento de
        certas partes do site.
      </p>

      <h2>Dúvidas</h2>
      <p>
        Fale com a gente em <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        Veja também nossa <a href="/privacidade">Política de Privacidade</a>.
      </p>
    </Prose>
  );
}
