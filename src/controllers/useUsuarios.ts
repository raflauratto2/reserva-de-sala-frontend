import { useQuery } from '@apollo/client';
import { GET_USUARIOS } from '@/graphql/queries/usuarios';
import { User } from '@/models/User';

export const useUsuarios = (skip = 0, limit = 100) => {
  const { data, loading, error, refetch } = useQuery(GET_USUARIOS, {
    variables: { skip, limit },
    errorPolicy: 'all', // Continua mesmo se houver erro
    skip: false, // Sempre tenta executar
  });

  // Log para debug
  if (error) {
    console.warn('Erro ao buscar usuários:', error);
  }

  if (data) {
    console.log('Usuários carregados:', data?.usuarios?.length || 0);
  }

  return {
    usuarios: (data?.usuarios || []) as User[],
    loading,
    error,
    refetch,
  };
};

