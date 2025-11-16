import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useAuth } from '@/controllers/useAuth';
import { useMeuPerfil } from '@/controllers/useMeuPerfil';
import { useContarReservasNaoVistas } from '@/controllers/useParticipantes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EditPerfilModal } from '@/components/EditPerfilModal';
import { NotificacoesModal } from '@/components/NotificacoesModal';

export const Layout = () => {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const { handleLogout } = useAuth();
  const { perfil } = useMeuPerfil();
  const location = useLocation();
  const [editPerfilOpen, setEditPerfilOpen] = useState(false);
  const [notificacoesOpen, setNotificacoesOpen] = useState(false);
  
  // Conta notificações não vistas
  const { count: notificacoesNaoVistas, refetch: refetchContador } = useContarReservasNaoVistas();

  // Carrega o perfil quando o usuário está autenticado mas não tem perfil carregado
  useEffect(() => {
    if (isAuthenticated && perfil && (!user || user.id !== perfil.id)) {
      setUser(perfil);
    }
  }, [isAuthenticated, perfil, user, setUser]);

  // Força atualização do contador quando o usuário faz login
  useEffect(() => {
    if (isAuthenticated) {
      // Pequeno delay para garantir que o token está disponível
      const timer = setTimeout(() => {
        refetchContador();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, refetchContador]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">Sistema de Reservas</h1>
              <nav className="flex gap-4">
                <Link
                  to="/dashboard"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === '/dashboard'
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  Dashboard
                </Link>
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
                {user?.admin && (
                  <Link
                    to="/usuarios"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      location.pathname.startsWith('/usuarios')
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    Usuários
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {user?.username || user?.email}
                  {user?.admin && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                      Admin
                    </span>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditPerfilOpen(true)}
                  className="h-8 w-8 p-0"
                  title="Editar perfil"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotificacoesOpen(true)}
                  className="h-8 w-8 p-0 relative"
                  title="Notificações"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notificacoesNaoVistas > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notificacoesNaoVistas > 9 ? '9+' : notificacoesNaoVistas}
                    </span>
                  )}
                </Button>
              </div>
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
      <EditPerfilModal open={editPerfilOpen} onOpenChange={setEditPerfilOpen} />
      <NotificacoesModal 
        open={notificacoesOpen} 
        onOpenChange={setNotificacoesOpen}
        onNotificacaoMarcadaComoVista={refetchContador}
      />
    </div>
  );
};

