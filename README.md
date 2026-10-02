# Lucavero Multiserviços

Hub de serviços inteligentes e gratuitos para o dia a dia — finanças, documentos,
trabalho, consultas e direitos. Hospedado em [lucavero.com](https://lucavero.com).

Interface minimalista (estilo Google): logotipo, slogan, busca central e cards
coloridos por área, com ferramentas objetivas e, em breve, recursos de IA.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (design system em `src/app/globals.css`)
- **lucide-react** (ícones), **qrcode** + **jsqr** (Pix/QR)
- Deploy alvo: **Vercel**; domínio apontado a partir da Hostinger

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
```

## Arquitetura

| Caminho | O que é |
| --- | --- |
| `src/lib/services.ts` | **Registro central** de serviços e categorias (fonte única) |
| `src/lib/br.ts` | Regras BR: INSS, IRRF, CPF/CNPJ/PIS, payload Pix |
| `src/lib/format.ts` / `extenso.ts` / `holidays.ts` | Utilitários (moeda, extenso, feriados) |
| `src/components/tools/*` | Uma ferramenta por arquivo (client components) |
| `src/components/tools/ToolLoader.tsx` | Mapa `slug → componente` (carregamento sob demanda) |
| `src/app/ferramentas/[slug]` | Rota dinâmica de cada ferramenta |
| `src/app/categoria/[id]` | Página por área |

### Adicionar uma ferramenta nova

1. Acrescente o item em `SERVICES` (`src/lib/services.ts`) com `status: "live"`.
2. Crie o componente em `src/components/tools/MinhaFerramenta.tsx`.
3. Registre o slug em `src/components/tools/ToolLoader.tsx`.

## Blog (painel em /admin/blog)

Os artigos são arquivos Markdown em `content/blog/<slug>.md`, com metadados no
cabeçalho (título, descrição, data, categoria, capa, FAQ, ferramentas relacionadas).
Eles são criados e editados pelo painel em **/admin/blog** (login com `ADMIN_PASSWORD`):

- editor com barra de formatação, pré-visualização, envio de imagens e cards de ferramenta
  (`[[ferramenta:slug]]`);
- agendamento: artigos com data futura aparecem sozinhos no horário (as páginas revalidam a cada 1h);
- checklist de SEO, prévia do Google, perguntas frequentes (FAQPage) e imagem social automática.

**Como a publicação funciona (custo zero):** em produção o painel grava os arquivos no
GitHub pela API e a Vercel faz o deploy automático (~1–2 min). Configure na Vercel:
`GITHUB_TOKEN` (token fine-grained, permissão *Contents: Read and write* só neste repositório)
e `GITHUB_REPO` (`dono/repositorio`). Rodando localmente (`npm run dev`), sem token,
o painel grava direto na pasta.

SEO do blog: sitemap, RSS (`/blog/rss.xml`), páginas por categoria, dados estruturados
(BlogPosting, BreadcrumbList, FAQPage) e Open Graph por artigo.

## Status atual

**Finanças:** simulador de financiamento, DAS do MEI (2026), conversor de moedas, juros de
boleto, reajuste de aluguel (IGP-M/IPCA/INPC), correção pela inflação, à vista ou parcelado,
juros do parcelamento, juros compostos, comparador CDB/LCI/Tesouro/poupança, simulador de
rendimento, reserva de emergência, orçamento 50/30/20, porcentagem, viver de renda.
Índices e taxas vêm da API pública do Banco Central (`/api/indices`, `/api/taxas`).

**Trabalho:** salário líquido, IRRF (tabelas 2026 + redução da Lei 15.270/2025), férias/13º,
rescisão, valor da hora.

**Documentos, consultas, utilidades e direitos:** currículo, recibo, Pix, QR Code, CEP, CNPJ,
bancos, feriados, FIPE, dias úteis, gerador de CPF/CNPJ/PIS e as ferramentas de IA
(contratos, requerimentos, juridiquês, direitos — usam `ANTHROPIC_API_KEY`, com custo por uso).

## Configuração

Copie `.env.example` para `.env.local`. As tabelas de imposto (INSS/IRRF/salário mínimo)
ficam em `src/lib/br.ts` e devem ser atualizadas todo ano.
