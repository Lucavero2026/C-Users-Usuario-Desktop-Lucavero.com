import Script from "next/script";
import { SITE } from "@/lib/site";

/**
 * Carrega o script do Google AdSense (Auto Ads). Os anúncios aparecem
 * automaticamente onde o Google julgar melhor, sem blocos manuais.
 * Só é injetado em produção para não gerar erros em desenvolvimento.
 */
export function AdSense() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || SITE.adsenseClient;
  if (process.env.NODE_ENV !== "production" || !client) return null;
  return (
    <Script
      id="adsbygoogle-init"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  );
}
