import { NextResponse } from "next/server";
import { SERVICES } from "@/lib/services";
import { askText, extractJSON, aiConfigured } from "@/lib/ai";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;

interface Intent {
  action: "open" | "answer" | "none";
  slug?: string;
  answer?: string;
}

export async function POST(req: Request) {
  if (!aiConfigured()) {
    return NextResponse.json({ action: "none" });
  }
  const { ok } = rateLimit(`busca:${clientKey(req)}`, { limit: 20 });
  if (!ok) {
    return NextResponse.json(
      { action: "answer", answer: "Muitas buscas seguidas. Aguarde um instante e tente de novo." },
      { status: 429 },
    );
  }

  let q = "";
  try {
    const body = await req.json();
    q = String(body?.q || "").slice(0, 300);
  } catch {
    return NextResponse.json({ action: "none" }, { status: 400 });
  }
  if (!q.trim()) return NextResponse.json({ action: "none" });

  const catalogo = SERVICES.filter((s) => s.status === "live")
    .map((s) => `- ${s.slug}: ${s.name} — ${s.short}`)
    .join("\n");

  const system = `Você é o assistente de busca do Lucavero Multiserviços, um site brasileiro de ferramentas úteis. O usuário digita uma frase em linguagem natural e você decide a melhor ação.

Ferramentas disponíveis (slug: nome — descrição):
${catalogo}

Responda SOMENTE com um JSON válido, sem texto extra, no formato:
{"action":"open"|"answer"|"none","slug":"<slug-da-ferramenta>","answer":"<resposta curta>"}

Regras:
- Se a intenção corresponder a uma ferramenta da lista, use "open" e o "slug" exato dela.
- Se for uma pergunta factual simples e direta que você pode responder em 1-2 frases (ex: "quantos dias faltam para o Natal"), use "answer" com uma resposta curta e correta em português. Hoje é ${new Date().toLocaleDateString("pt-BR")}.
- Se não corresponder a nada, use "none".
- Nunca invente slug fora da lista.`;

  try {
    const text = await askText({ system, user: q, maxTokens: 600 });
    const intent = extractJSON<Intent>(text);
    if (!intent) return NextResponse.json({ action: "none" });

    if (intent.action === "open" && intent.slug) {
      const exists = SERVICES.some(
        (s) => s.slug === intent.slug && s.status === "live",
      );
      if (!exists) return NextResponse.json({ action: "none" });
    }
    return NextResponse.json(intent);
  } catch (e) {
    console.error("busca IA erro:", e);
    return NextResponse.json({ action: "none" }, { status: 500 });
  }
}
