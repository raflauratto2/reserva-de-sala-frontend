import { useQuery, useMutation } from '@apollo/client';
import { GET_SALAS, GET_SALA, GET_MINHAS_SALAS } from '@/graphql/queries/salas';
import { CREATE_SALA, UPDATE_SALA, DELETE_SALA } from '@/graphql/mutations/salas';
import { SalaInput, SalaUpdateInput, SalaFormData } from '@/models/Sala';

export const useSalas = (skip = 0, limit = 100, apenasAtivas = false) => {
  const { data, loading, error, refetch } = useQuery(GET_SALAS, {
    variables: { skip, limit, apenasAtivas },
  });

  return {
    salas: data?.salas || [],
    loading,
    error,
    refetch,
  };
};

export const useSala = (salaId: number) => {
  const { data, loading, error } = useQuery(GET_SALA, {
    variables: { salaId },
    skip: !salaId,
  });

  return {
    sala: data?.sala,
    loading,
    error,
  };
};

export const useMinhasSalas = (skip = 0, limit = 100) => {
  const { data, loading, error, refetch } = useQuery(GET_MINHAS_SALAS, {
    variables: { skip, limit },
  });

  return {
    salas: data?.minhasSalas || [],
    loading,
    error,
    refetch,
  };
};

export const useCreateSala = () => {
  const [createSala, { loading, error }] = useMutation(CREATE_SALA, {
    refetchQueries: [{ query: GET_SALAS }, { query: GET_MINHAS_SALAS }],
  });

  const handleCreate = async (formData: SalaFormData) => {
    try {
      const sala: SalaInput = {
        nome: formData.nome,
        local: formData.local,
        ...(formData.capacidade && { capacidade: formData.capacidade }),
        ...(formData.descricao && { descricao: formData.descricao }),
      };

      const { data } = await createSala({
        variables: { sala },
      });

      return { success: true, data: data?.criarSala };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erro ao criar sala',
        graphQLErrors: err.graphQLErrors,
      };
    }
  };

  return {
    handleCreate,
    loading,
    error,
  };
};

export const useUpdateSala = () => {
  const [updateSala, { loading, error }] = useMutation(UPDATE_SALA, {
    refetchQueries: [{ query: GET_SALAS }, { query: GET_MINHAS_SALAS }],
  });

  const handleUpdate = async (salaId: number, formData: Partial<SalaFormData> & { ativa?: boolean }) => {
    try {
      const sala: SalaUpdateInput = {};
      
      if (formData.nome) sala.nome = formData.nome;
      if (formData.local) sala.local = formData.local;
      if (formData.capacidade !== undefined) sala.capacidade = formData.capacidade;
      if (formData.descricao !== undefined) sala.descricao = formData.descricao;
      if (formData.ativa !== undefined) sala.ativa = formData.ativa;

      const { data } = await updateSala({
        variables: { salaId, sala },
      });

      return { success: true, data: data?.atualizarSala };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erro ao atualizar sala',
        graphQLErrors: err.graphQLErrors,
      };
    }
  };

  return {
    handleUpdate,
    loading,
    error,
  };
};

export const useDeleteSala = () => {
  const [deleteSala, { loading, error }] = useMutation(DELETE_SALA, {
    refetchQueries: [{ query: GET_SALAS }, { query: GET_MINHAS_SALAS }],
  });

  const handleDelete = async (salaId: number) => {
    try {
      const { data } = await deleteSala({
        variables: { salaId },
      });

      return { success: data?.deletarSala || false };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erro ao excluir sala',
      };
    }
  };

  return {
    handleDelete,
    loading,
    error,
  };
};

