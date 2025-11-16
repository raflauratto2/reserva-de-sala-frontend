import { useQuery, useMutation } from '@apollo/client';
import { GET_USUARIOS } from '@/graphql/queries/usuarios';
import { CRIAR_USUARIO_ADMIN, ATUALIZAR_USUARIO_ADMIN, DELETAR_USUARIO } from '@/graphql/mutations/usuarios';
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

  const [criarUsuarioAdminMutation] = useMutation(CRIAR_USUARIO_ADMIN);
  const [atualizarUsuarioAdminMutation] = useMutation(ATUALIZAR_USUARIO_ADMIN);
  const [deletarUsuarioMutation] = useMutation(DELETAR_USUARIO);

  const criarUsuarioAdmin = async (usuario: {
    nome?: string;
    username: string;
    email: string;
    password: string;
    admin?: boolean;
  }) => {
    try {
      const { data, errors } = await criarUsuarioAdminMutation({
        variables: { usuario },
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      if (!data?.criarUsuarioAdmin) {
        throw new Error('Não foi possível criar o usuário. Tente novamente.');
      }

      await refetch();
      return { success: true, data: data.criarUsuarioAdmin };
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Erro ao criar usuário';
      return { success: false, error: errorMessage };
    }
  };

  const atualizarUsuarioAdmin = async (
    usuarioId: number,
    usuario: {
      nome?: string;
      email?: string;
      password?: string;
      admin?: boolean;
    }
  ) => {
    try {
      const { data, errors } = await atualizarUsuarioAdminMutation({
        variables: { usuarioId, usuario },
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      if (!data?.atualizarUsuarioAdmin) {
        throw new Error('Não foi possível atualizar o usuário. Tente novamente.');
      }

      await refetch();
      return { success: true, data: data.atualizarUsuarioAdmin };
    } catch (err: any) {
      console.error('Erro ao atualizar usuário:', err);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Erro ao atualizar usuário';
      return { success: false, error: errorMessage };
    }
  };

  const deletarUsuario = async (usuarioId: number) => {
    try {
      const { data, errors } = await deletarUsuarioMutation({
        variables: { usuarioId },
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      if (!data?.deletarUsuario) {
        throw new Error('Não foi possível deletar o usuário. Tente novamente.');
      }

      await refetch();
      return { success: true };
    } catch (err: any) {
      console.error('Erro ao deletar usuário:', err);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Erro ao deletar usuário';
      return { success: false, error: errorMessage };
    }
  };

  return {
    usuarios: (data?.usuarios || []) as User[],
    loading,
    error,
    refetch,
    criarUsuarioAdmin,
    atualizarUsuarioAdmin,
    deletarUsuario,
  };
};

