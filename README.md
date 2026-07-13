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

## Status atual (MVP)

**No ar:** salário líquido, IRRF, férias/13º, valor da hora, conversor de moedas,
juros de boleto, consulta de CEP/CNPJ/bancos, feriados, dias úteis, Pix Copia e
Cola + QR, link de WhatsApp, criador/leitor de QR, gerador e validador de
CPF/CNPJ/PIS, emissor de recibo em PDF.

**Fase 2 (IA — precisa de `ANTHROPIC_API_KEY`):** gerador de contratos,
decodificador de juridiquês, requerimentos/recursos, verificador de marca,
consulte seus direitos, e a busca inteligente por intenção.

## Configuração

Copie `.env.example` para `.env.local`. As tabelas de imposto (INSS/IRRF) ficam
em `src/lib/br.ts` e devem ser atualizadas a cada ano.
