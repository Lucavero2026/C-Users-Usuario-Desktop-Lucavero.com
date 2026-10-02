import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { sanitizePost, type Post } from "@/lib/blog-shared";
import { deletePost, postExists, savePost, storeMode } from "@/lib/blog-store";

export const runtime = "nodejs";

function revalidateBlog(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/blog/${slug}`);
}

/** Cria ou atualiza um artigo. Corpo: { post, previousSlug? } */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  }
  let body: { post?: Partial<Post>; previousSlug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  const { post, error } = sanitizePost(body.post || {});
  if (!post) return NextResponse.json({ error }, { status: 400 });

  const previousSlug = body.previousSlug || undefined;
  try {
    if (post.slug !== previousSlug && (await postExists(post.slug))) {
      return NextResponse.json(
        { error: "Já existe um artigo com esse endereço (slug). Escolha outro." },
        { status: 409 },
      );
    }
    await savePost(post, previousSlug);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Não foi possível salvar." },
      { status: 500 },
    );
  }
  revalidateBlog(post.slug);
  return NextResponse.json({ ok: true, slug: post.slug, mode: storeMode() });
}

/** Exclui um artigo: DELETE /api/admin/blog?slug=... */
export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  }
  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Artigo inválido." }, { status: 400 });
  }
  try {
    await deletePost(slug);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Não foi possível excluir." },
      { status: 500 },
    );
  }
  revalidateBlog(slug);
  return NextResponse.json({ ok: true, mode: storeMode() });
}
