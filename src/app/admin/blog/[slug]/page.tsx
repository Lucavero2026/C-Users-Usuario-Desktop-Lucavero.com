import Link from "next/link";
import { AdminGate } from "@/components/admin/AdminGate";
import { PostEditor } from "@/components/admin/PostEditor";
import { loadPost, storeMode } from "@/lib/blog-store";

export default async function EditarArtigoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ salvo?: string }>;
}) {
  const { slug } = await params;
  const { salvo } = await searchParams;
  return (
    <AdminGate>
      <Editor slug={slug} salvo={!!salvo} />
    </AdminGate>
  );
}

async function Editor({ slug, salvo }: { slug: string; salvo: boolean }) {
  let post = null;
  let erro = "";
  try {
    post = await loadPost(slug);
  } catch (e) {
    erro = e instanceof Error ? e.message : "Erro ao carregar o artigo.";
  }
  if (!post) {
    return (
      <div className="container-page max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
        <p className="mt-2 text-muted">{erro || "Talvez ele tenha sido excluído ou renomeado."}</p>
        <Link href="/admin/blog" className="mt-4 inline-block text-brand hover:underline">
          ← Voltar para os artigos
        </Link>
      </div>
    );
  }
  return (
    <div className="container-page py-8">
      <PostEditor key={post.slug} initial={post} isNew={false} mode={storeMode()} justSaved={salvo} />
    </div>
  );
}
