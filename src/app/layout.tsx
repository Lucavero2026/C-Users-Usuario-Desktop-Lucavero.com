import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://lucavero.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lucavero Multiserviços — ferramentas inteligentes para o dia a dia",
    template: "%s · Lucavero Multiserviços",
  },
  description:
    "Um hub de serviços inteligentes: calculadoras de salário e finanças, gerador de contratos e recibos, Pix e QR Code, consultas de CEP e CNPJ, e muito mais. Grátis.",
  keywords: [
    "calculadora salário líquido",
    "gerar pix",
    "consulta cep",
    "consulta cnpj",
    "gerador de recibo",
    "validar cpf",
    "ferramentas online",
  ],
  applicationName: "Lucavero Multiserviços",
  authors: [{ name: "RCO COMUNICAÇÕES LTDA" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Lucavero Multiserviços",
    title: "Lucavero Multiserviços — ferramentas inteligentes para o dia a dia",
    description:
      "Calculadoras, geradores de documentos, Pix, QR Code e consultas — tudo em um só lugar, de graça.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
