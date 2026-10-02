import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Rss } from "lucide-react";
import { BLOG_CATEGORIES, formatPostDate, getBlogCategory } from "@/lib/blog-shared";
import { POSTS_PER_PAGE, totalPages, type PostWithMeta } from "@/lib/blog";

export function PostCard({ post, headingLevel = "h2" }: { post: PostWithMeta; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const cat = getBlogCategory(post.category);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="focus-ring card group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {post.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover}
          alt={post.coverAlt || ""}
          loading="lazy"
          className="aspect-[1200/630] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[1200/630] items-center justify-center bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 text-5xl dark:from-indigo-950/40 dark:via-sky-950/30 dark:to-emerald-950/30">
          {post.emoji}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        {cat && (
          <span className="inline-flex w-fit rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
            {cat.name}
          </span>
        )}
        <H className="mt-2 text-lg font-bold leading-snug group-hover:text-brand">{post.title}</H>
        <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted">{post.description}</p>
        <span className="mt-4 flex items-center gap-2 text-xs text-muted">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>·
          <Clock className="h-3 w-3" /> {post.readingMinutes} min
        </span>
      </div>
    </Link>
  );
}

export function CategoryChips({ active }: { active?: string }) {
  return (
    <nav aria-label="Categorias do blog" className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={`focus-ring rounded-full border px-3.5 py-1.5 text-sm ${
          !active ? "border-brand bg-brand text-white" : "border-border bg-surface hover:border-brand hover:text-brand"
        }`}
      >
        Todos
      </Link>
      {BLOG_CATEGORIES.map((c) => (
        <Link
          key={c.id}
          href={`/blog/categoria/${c.id}`}
          className={`focus-ring rounded-full border px-3.5 py-1.5 text-sm ${
            active === c.id
              ? "border-brand bg-brand text-white"
              : "border-border bg-surface hover:border-brand hover:text-brand"
          }`}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );
}

/** Lista paginada de artigos (página do blog, páginas 2+ e categorias). */
export function BlogListing({
  posts,
  page,
  basePath,
  title,
  intro,
  activeCategory,
  showFeatured,
}: {
  posts: PostWithMeta[];
  page: number;
  basePath: string;
  title: string;
  intro: string;
  activeCategory?: string;
  showFeatured?: boolean;
}) {
  let list = posts;
  let featured: PostWithMeta | undefined;
  // O destaque sai da lista em todas as páginas, para a paginação não repetir artigos.
  if (showFeatured && posts.length > 3) {
    featured = posts.find((p) => p.featured) || posts[0];
    list = posts.filter((p) => p !== featured);
    if (page !== 1) featured = undefined;
  }
  const pages = totalPages(list.length);
  const start = (page - 1) * POSTS_PER_PAGE;
  const pageItems = list.slice(start, start + POSTS_PER_PAGE);
  const href = (n: number) => (n === 1 ? basePath : `${basePath}/pagina/${n}`);

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <a href="/blog/rss.xml" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
            <Rss className="h-4 w-4" /> RSS
          </a>
        </div>
        <p className="mt-2 max-w-2xl text-muted">{intro}</p>
        <div className="mt-6">
          <CategoryChips active={activeCategory} />
        </div>
      </header>

      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="focus-ring card group mb-8 grid overflow-hidden transition-all hover:shadow-lg md:grid-cols-2"
        >
          {featured.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={featured.cover} alt={featured.coverAlt || ""} className="h-full max-h-80 w-full object-cover" />
          ) : (
            <div className="flex min-h-56 items-center justify-center bg-gradient-to-br from-indigo-100 via-sky-100 to-emerald-100 text-7xl dark:from-indigo-950/50 dark:via-sky-950/40 dark:to-emerald-950/40">
              {featured.emoji}
            </div>
          )}
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand">Destaque</span>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight group-hover:text-brand">{featured.title}</h2>
            <p className="mt-2 text-muted">{featured.description}</p>
            <span className="mt-4 text-xs text-muted">
              {formatPostDate(featured.date)} · {featured.readingMinutes} min de leitura
            </span>
          </div>
        </Link>
      )}

      {pageItems.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          Ainda não há artigos aqui. Volte em breve!
        </p>
      )}

      {pages > 1 && (
        <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={href(page - 1)} rel="prev" className="focus-ring inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm hover:border-brand hover:text-brand">
              <ChevronLeft className="h-4 w-4" /> Anteriores
            </Link>
          )}
          <span className="px-3 text-sm text-muted">
            Página {page} de {pages}
          </span>
          {page < pages && (
            <Link href={href(page + 1)} rel="next" className="focus-ring inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm hover:border-brand hover:text-brand">
              Mais artigos <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
