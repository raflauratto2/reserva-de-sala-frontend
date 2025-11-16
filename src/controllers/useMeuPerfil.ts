import { useQuery } from '@apollo/client';
import { MEU_PERFIL } from '@/graphql/queries/auth';
import { useAuthStore } from '@/store/auth-store';
import { User } from '@/models/User';

export const useMeuPerfil = () => {
  const { isAuthenticated } = useAuthStore();
  const { data, loading, error, refetch } = useQuery(MEU_PERFIL, {
    errorPolicy: 'all',
    skip: !isAuthenticated, // Não executa a query se o usuário não estiver autenticado
  });

  return {
    perfil: data?.meuPerfil as User | undefined,
    loading,
    error,
    refetch,
    isAdmin: data?.meuPerfil?.admin === true,
  };
};

