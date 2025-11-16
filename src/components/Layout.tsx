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
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          {/* Título - sempre no topo em mobile */}
          <div className="mb-3 md:mb-0">
            <h1 className="text-lg sm:text-xl font-bold">Sistema de Reservas</h1>
          </div>
          
          {/* Conteúdo do header - organizado em coluna no mobile, linha no desktop */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            {/* Navegação */}
            <nav className="flex flex-wrap gap-2 sm:gap-4">
              <Link
                to="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-2 py-1 rounded",
                  location.pathname === '/dashboard'
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                )}
              >
                Dashboard
              </Link>
              <Link
                to="/reservas"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-2 py-1 rounded",
                  location.pathname.startsWith('/reservas')
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                )}
              >
                Reservas
              </Link>
              <Link
                to="/salas"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-2 py-1 rounded",
                  location.pathname.startsWith('/salas')
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                )}
              >
                Salas
              </Link>
              <Link
                to="/historico"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-2 py-1 rounded",
                  location.pathname.startsWith('/historico')
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                )}
              >
                Histórico
              </Link>
              {user?.admin && (
                <Link
                  to="/usuarios"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-2 py-1 rounded",
                    location.pathname.startsWith('/usuarios')
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  )}
                >
                  Usuários
                </Link>
              )}
            </nav>
            
            {/* Controles do usuário */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                  {user?.username || user?.email}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground sm:hidden truncate max-w-[100px]">
                  {user?.username || user?.email}
                </span>
                {user?.admin && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded whitespace-nowrap">
                    Admin
                  </span>
                )}
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
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs sm:text-sm">
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

