import { useQuery, useMutation } from '@apollo/client';
import { GET_RESERVAS, GET_RESERVA } from '@/graphql/queries/reservas';
import { CREATE_RESERVA, UPDATE_RESERVA, DELETE_RESERVA } from '@/graphql/mutations/reservas';
import { ReservaInput, ReservaFormData } from '@/models/Reserva';
import { format } from 'date-fns';

export const useReservas = () => {
  const { data, loading, error, refetch } = useQuery(GET_RESERVAS);

  return {
    reservas: data?.reservas || [],
    loading,
    error,
    refetch,
  };
};

export const useReserva = (id: string) => {
  const { data, loading, error } = useQuery(GET_RESERVA, {
    variables: { id },
    skip: !id,
  });

  return {
    reserva: data?.reserva,
    loading,
    error,
  };
};

export const useCreateReserva = () => {
  const [createReserva, { loading, error }] = useMutation(CREATE_RESERVA, {
    refetchQueries: [{ query: GET_RESERVAS }],
  });

  const handleCreate = async (formData: ReservaFormData) => {
    try {
      const input: ReservaInput = {
        local: formData.local,
        sala: formData.sala,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        responsavel: formData.responsavel,
        cafe: formData.cafeQuantidade && formData.cafeDescricao
          ? {
              quantidade: formData.cafeQuantidade,
              descricao: formData.cafeDescricao,
            }
          : null,
      };

      const { data } = await createReserva({
        variables: { input },
      });

      return { success: true, data: data?.createReserva };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erro ao criar reserva',
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

export const useUpdateReserva = () => {
  const [updateReserva, { loading, error }] = useMutation(UPDATE_RESERVA, {
    refetchQueries: [{ query: GET_RESERVAS }],
  });

  const handleUpdate = async (id: string, formData: ReservaFormData) => {
    try {
      const input: ReservaInput = {
        local: formData.local,
        sala: formData.sala,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        responsavel: formData.responsavel,
        cafe: formData.cafeQuantidade && formData.cafeDescricao
          ? {
              quantidade: formData.cafeQuantidade,
              descricao: formData.cafeDescricao,
            }
          : null,
      };

      const { data } = await updateReserva({
        variables: { id, input },
      });

      return { success: true, data: data?.updateReserva };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erro ao atualizar reserva',
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

export const useDeleteReserva = () => {
  const [deleteReserva, { loading, error }] = useMutation(DELETE_RESERVA, {
    refetchQueries: [{ query: GET_RESERVAS }],
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteReserva({
        variables: { id },
      });

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erro ao excluir reserva',
      };
    }
  };

  return {
    handleDelete,
    loading,
    error,
  };
};

