import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Os artigos do blog são lidos do disco em tempo de execução (ISR), então os
  // arquivos precisam ir junto no pacote das funções da Vercel.
  outputFileTracingIncludes: {
    "/**": ["./content/blog/**/*"],
  },
};

export default nextConfig;
