import { ImageResponse } from "next/og";
import { getPublishedPost } from "@/lib/blog";
import { getBlogCategory } from "@/lib/blog-shared";

export const revalidate = 86400;

/**
 * Imagem de compartilhamento (1200×630) gerada automaticamente com o título
 * do artigo — usada quando o artigo não tem imagem de capa.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  const title = post?.title || "Blog Lucavero";
  const cat = post ? getBlogCategory(post.category)?.name : "Blog";
  const size = title.length > 80 ? 52 : title.length > 50 ? 60 : 70;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #eef2ff 0%, #e0f2fe 50%, #ecfdf5 100%)",
          color: "#0f172a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              borderRadius: 999,
              background: "#4f46e5",
              color: "white",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {cat}
          </div>
          <div style={{ fontSize: 64 }}>{post?.emoji || "📝"}</div>
        </div>
        <div style={{ display: "flex", fontSize: size, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1 }}>
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#475569" }}>
          <span style={{ fontWeight: 700, color: "#4f46e5" }}>lucavero.com</span>
          <span>Ferramentas grátis para o seu dinheiro</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, emoji: "twemoji" },
  );
}
