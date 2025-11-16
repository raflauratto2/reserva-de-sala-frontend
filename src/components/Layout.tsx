import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useAuth } from '@/controllers/useAuth';
import { useMeuPerfil } from '@/controllers/useMeuPerfil';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Layout = () => {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const { handleLogout } = useAuth();
  const { perfil, loading: loadingPerfil } = useMeuPerfil();
  const location = useLocation();

  // Carrega o perfil quando o usuário está autenticado mas não tem perfil carregado
  useEffect(() => {
    if (isAuthenticated && perfil && (!user || user.id !== perfil.id)) {
      setUser(perfil);
    }
  }, [isAuthenticated, perfil, user, setUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">Sistema de Reservas</h1>
              <nav className="flex gap-4">
                <Link
                  to="/reservas"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname.startsWith('/reservas')
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Reservas
                </Link>
                <Link
                  to="/salas"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname.startsWith('/salas')
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Salas
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.username || user?.email}
                {user?.admin && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                    Admin
                  </span>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

