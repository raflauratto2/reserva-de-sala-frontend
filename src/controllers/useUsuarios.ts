import { useQuery } from '@apollo/client';
import { GET_USUARIOS } from '@/graphql/queries/usuarios';
import { User } from '@/models/User';
import { useAuthStore } from '@/store/auth-store';

export const useUsuarios = (skip = 0, limit = 100) => {
  const { isAuthenticated } = useAuthStore();
  const { data, loading, error, refetch } = useQuery(GET_USUARIOS, {
    skip: !isAuthenticated, // Só executa quando autenticado
    variables: { skip, limit },
    errorPolicy: 'all', // Continua mesmo se houver erro
    fetchPolicy: 'cache-and-network', // Busca da rede mesmo se tiver cache
  });

  return {
    usuarios: (data?.usuarios || []) as User[],
    loading,
    error,
    refetch,
  };
};

