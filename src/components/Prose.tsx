export function Prose({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {updated && (
        <p className="mt-2 text-sm text-muted">Última atualização: {updated}</p>
      )}
      <div className="prose-lv mt-8 space-y-4 text-foreground/90">{children}</div>
    </div>
  );
}
