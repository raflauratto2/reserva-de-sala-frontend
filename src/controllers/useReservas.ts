import { useQuery, useMutation } from '@apollo/client';
import { GET_RESERVAS, GET_RESERVA } from '@/graphql/queries/reservas';
import { CREATE_RESERVA, UPDATE_RESERVA, DELETE_RESERVA } from '@/graphql/mutations/reservas';
import { ReservaInput, ReservaUpdateInput, ReservaFormData } from '@/models/Reserva';

export const useReservas = (skip = 0, limit = 100) => {
  const { data, loading, error, refetch } = useQuery(GET_RESERVAS, {
    variables: { skip, limit },
  });

  return {
    reservas: data?.reservas || [],
    loading,
    error,
    refetch,
  };
};

export const useReserva = (reservaId: number) => {
  const { data, loading, error } = useQuery(GET_RESERVA, {
    variables: { reservaId },
    skip: !reservaId,
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
      const reserva: ReservaInput = {
        local: formData.local,
        sala: formData.sala,
        dataHoraInicio: formData.dataHoraInicio,
        dataHoraFim: formData.dataHoraFim,
        ...(formData.cafeQuantidade && { cafeQuantidade: formData.cafeQuantidade }),
        ...(formData.cafeDescricao && { cafeDescricao: formData.cafeDescricao }),
      };

      const { data } = await createReserva({
        variables: { reserva },
      });

      return { success: true, data: data?.criarReserva };
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

  const handleUpdate = async (reservaId: number, formData: Partial<ReservaFormData>) => {
    try {
      const reserva: ReservaUpdateInput = {};
      
      if (formData.local) reserva.local = formData.local;
      if (formData.sala) reserva.sala = formData.sala;
      if (formData.dataHoraInicio) reserva.dataHoraInicio = formData.dataHoraInicio;
      if (formData.dataHoraFim) reserva.dataHoraFim = formData.dataHoraFim;
      if (formData.cafeQuantidade !== undefined) reserva.cafeQuantidade = formData.cafeQuantidade;
      if (formData.cafeDescricao) reserva.cafeDescricao = formData.cafeDescricao;

      const { data } = await updateReserva({
        variables: { reservaId, reserva },
      });

      return { success: true, data: data?.atualizarReserva };
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

  const handleDelete = async (reservaId: number) => {
    try {
      const { data } = await deleteReserva({
        variables: { reservaId },
      });

      return { success: data?.deletarReserva || false };
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

