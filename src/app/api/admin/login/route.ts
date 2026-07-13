import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminEnabled, checkPassword, expectedToken } from "@/lib/admin";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminEnabled()) {
    return NextResponse.json(
      { error: "Área administrativa não configurada (defina ADMIN_PASSWORD)." },
      { status: 503 },
    );
  }
  const { ok } = rateLimit(`admin:${clientKey(req)}`, { limit: 5, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 },
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password || "");
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });
  return res;
}
