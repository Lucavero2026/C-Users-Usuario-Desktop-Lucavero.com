import "server-only";
import { createHash } from "crypto";

/**
 * Gate simples de administrador por senha (env ADMIN_PASSWORD).
 * O cookie guarda um hash da senha + um "sal" fixo — nunca a senha em texto.
 */
export const ADMIN_COOKIE = "lv_admin";

export function adminEnabled(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}

export function expectedToken(): string {
  const pw = process.env.ADMIN_PASSWORD || "";
  return createHash("sha256").update(`lucavero::${pw}`).digest("hex");
}

export function checkPassword(password: string): boolean {
  return adminEnabled() && password === process.env.ADMIN_PASSWORD;
}

export function isValidToken(token: string | undefined): boolean {
  return adminEnabled() && !!token && token === expectedToken();
}
