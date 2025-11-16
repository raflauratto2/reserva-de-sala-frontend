import { useMutation } from '@apollo/client';
import { ATUALIZAR_PERFIL } from '@/graphql/mutations/perfil';
import { MEU_PERFIL } from '@/graphql/queries/auth';
import { useAuthStore } from '@/store/auth-store';
import { UpdatePerfilInput } from '@/models/User';

export const usePerfil = () => {
  const { setUser } = useAuthStore();
  const [atualizarPerfilMutation, { loading: loadingAtualizar, error: errorAtualizar }] = useMutation(ATUALIZAR_PERFIL, {
    refetchQueries: [{ query: MEU_PERFIL }],
  });

  const atualizarPerfil = async (input: UpdatePerfilInput) => {
    try {
      const { data, errors } = await atualizarPerfilMutation({
        variables: {
          usuario: input,
        },
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      if (data?.atualizarPerfil) {
        setUser(data.atualizarPerfil);
        return { success: true, data: data.atualizarPerfil };
      } else {
        throw new Error('Não foi possível atualizar o perfil.');
      }
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Erro ao atualizar perfil';
      throw new Error(errorMessage);
    }
  };

  return {
    atualizarPerfil,
    loadingAtualizar,
    errorAtualizar,
  };
};

