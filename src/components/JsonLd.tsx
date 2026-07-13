import { SITE } from "@/lib/site";
import type { Service } from "@/lib/services";
import { getCategory } from "@/lib/services";

/** Injeta um bloco JSON-LD (schema.org) para SEO. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organização + site com busca (aparece no topo do layout). */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#org`,
        name: SITE.name,
        url: SITE.url,
        legalName: SITE.owner,
        email: SITE.email,
        slogan: SITE.slogan,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        inLanguage: "pt-BR",
        publisher: { "@id": `${SITE.url}/#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE.url}/busca?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/** Estrutura de uma ferramenta como WebApplication + trilha de navegação. */
export function serviceJsonLd(service: Service) {
  const cat = getCategory(service.category);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: service.name,
        url: `${SITE.url}/ferramentas/${service.slug}`,
        description: service.description,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        inLanguage: "pt-BR",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        publisher: { "@id": `${SITE.url}/#org` },
        keywords: service.keywords.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
          {
            "@type": "ListItem",
            position: 2,
            name: cat.name,
            item: `${SITE.url}/categoria/${cat.id}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.name,
            item: `${SITE.url}/ferramentas/${service.slug}`,
          },
        ],
      },
    ],
  };
}
