import { adminEnabled, isAdmin } from "@/lib/admin";
import { AdminLogin } from "@/components/AdminLogin";

/** Mostra o conteúdo só para o administrador logado; senão, a tela de login. */
export async function AdminGate({ children }: { children: React.ReactNode }) {
  if (!adminEnabled()) {
    return (
      <div className="container-page max-w-lg py-16 text-center">
        <h1 className="text-2xl font-bold">Painel não configurado</h1>
        <p className="mt-2 text-muted">
          Defina a variável de ambiente <code>ADMIN_PASSWORD</code> (no <code>.env.local</code> e na
          Vercel) para ativar o painel administrativo.
        </p>
      </div>
    );
  }
  if (!(await isAdmin())) {
    return (
      <div className="container-page">
        <AdminLogin />
      </div>
    );
  }
  return <>{children}</>;
}
