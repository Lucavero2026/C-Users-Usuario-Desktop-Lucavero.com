import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o Lucavero Multiserviços trata seus dados, conforme a LGPD.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <Prose title="Política de Privacidade" updated="12 de julho de 2026">
      <p>
        Esta Política descreve como o <strong>{SITE.name}</strong> ({SITE.domain}),
        mantido por {SITE.owner} (CNPJ {SITE.cnpj}), trata dados pessoais, em
        conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 —
        LGPD).
      </p>

      <h2>1. Dados que coletamos</h2>
      <p>
        A maioria das nossas ferramentas funciona inteiramente no seu navegador e
        <strong> não envia seus dados para nossos servidores</strong>. Podemos
        tratar dados nas seguintes situações:
      </p>
      <ul>
        <li>
          <strong>Dados de uso e navegação:</strong> coletados automaticamente por
          cookies e serviços de análise e publicidade (ver seção 4).
        </li>
        <li>
          <strong>Dados fornecidos por você:</strong> quando entra em contato pelo
          formulário ou por e-mail (nome, e-mail e mensagem).
        </li>
        <li>
          <strong>Consultas a APIs públicas:</strong> ao usar ferramentas de
          consulta (CEP, CNPJ, cotações), o dado digitado é enviado ao serviço
          público correspondente apenas para retornar o resultado.
        </li>
      </ul>

      <h2>2. Para que usamos</h2>
      <ul>
        <li>Fornecer e melhorar as ferramentas e a experiência do site.</li>
        <li>Responder às suas mensagens de contato.</li>
        <li>Exibir publicidade e medir audiência de forma agregada.</li>
        <li>Cumprir obrigações legais.</li>
      </ul>

      <h2>3. Compartilhamento</h2>
      <p>
        Não vendemos seus dados. Podemos compartilhá-los com provedores que nos
        ajudam a operar o site, como Google (AdSense e Analytics) e as APIs
        públicas consultadas por você, sempre no limite necessário.
      </p>

      <h2>4. Cookies e publicidade</h2>
      <p>
        Utilizamos cookies próprios e de terceiros. O Google, como fornecedor
        terceirizado, utiliza cookies para exibir anúncios com base em visitas
        anteriores a este e outros sites. Você pode desativar a publicidade
        personalizada nas{" "}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          Configurações de anúncios do Google
        </a>
        . Veja também nossa <a href="/cookies">Política de Cookies</a>.
      </p>

      <h2>5. Seus direitos (LGPD)</h2>
      <p>
        Você pode solicitar acesso, correção, exclusão, portabilidade ou informação
        sobre o tratamento dos seus dados, além de revogar consentimentos. Para
        isso, escreva para <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>6. Segurança e retenção</h2>
      <p>
        Adotamos medidas técnicas e organizacionais razoáveis para proteger os
        dados e os mantemos apenas pelo tempo necessário às finalidades descritas
        ou exigido por lei.
      </p>

      <h2>7. Alterações</h2>
      <p>
        Esta Política pode ser atualizada. A data de revisão sempre constará no
        topo. Mudanças relevantes serão sinalizadas no site.
      </p>

      <h2>8. Contato do controlador</h2>
      <p>
        {SITE.owner} — CNPJ {SITE.cnpj} — {" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </Prose>
  );
}
