"use client";

import { useMemo } from "react";
import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

/**
 * Renderiza markdown (respostas da IA) com o estilo do site.
 * O conteúdo vem das nossas próprias rotas de IA e é exibido no navegador do
 * mesmo usuário que enviou o texto.
 */
export function Markdown({ children }: { children: string }) {
  const html = useMemo(() => marked.parse(children || "") as string, [children]);
  return (
    <div
      className="prose-lv"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
