import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-7xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-muted">
        O endereço não existe ou a ferramenta mudou de lugar. Tente buscar o que
        você precisa:
      </p>
      <div className="mt-8 w-full max-w-xl">
        <SearchBar />
      </div>
      <Link
        href="/"
        className="focus-ring mt-6 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface-muted"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
