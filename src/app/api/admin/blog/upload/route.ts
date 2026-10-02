import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { isAdmin } from "@/lib/admin";
import { slugify } from "@/lib/blog-shared";
import { saveImage } from "@/lib/blog-store";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};
const MAX_BYTES = 3 * 1024 * 1024;

/** Recebe uma imagem (form-data "file") e devolve { url }. */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  }
  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {
    /* corpo inválido */
  }
  if (!file) return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Use imagens JPG, PNG, WEBP ou GIF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagem acima de 3 MB." }, { status: 400 });
  }
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "imagem";
  const name = `${base.slice(0, 50)}-${randomBytes(3).toString("hex")}.${ext}`;
  try {
    const url = await saveImage(name, Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao enviar a imagem." },
      { status: 500 },
    );
  }
}
