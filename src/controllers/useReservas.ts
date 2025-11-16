import { useQuery, useMutation } from '@apollo/client';
import { GET_RESERVAS, GET_RESERVA, GET_HORARIOS_DISPONIVEIS_POR_HORA } from '@/graphql/queries/reservas';
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

export const useReserva = (reservaId: string | number) => {
  const id = typeof reservaId === 'string' ? parseInt(reservaId) : reservaId;
  const { data, loading, error } = useQuery(GET_RESERVA, {
    variables: { reservaId: id },
    skip: !id || isNaN(id),
  });

  return {
    reserva: data?.reserva,
    loading,
    error,
  };
};

export const useHorariosDisponiveisPorHora = (
  salaId: number | null,
  data: string | null,
  horaInicio = '08:00:00',
  horaFim = '17:00:00'
) => {
  const { data: queryData, loading, error, refetch } = useQuery(GET_HORARIOS_DISPONIVEIS_POR_HORA, {
    variables: {
      salaId: salaId!,
      data: data!,
      horaInicio,
      horaFim,
    },
    skip: !salaId || !data,
  });

  return {
    horarios: queryData?.horariosDisponiveisPorHora || [],
    loading,
    error,
    refetch,
  };
};

export const useCreateReserva = () => {
  const [createReserva, { loading, error }] = useMutation(CREATE_RESERVA, {
    refetchQueries: [{ query: GET_RESERVAS }],
  });

  const handleCreate = async (formData: ReservaFormData) => {
    try {
      if (!formData.salaId || !formData.data || !formData.hora) {
        throw new Error('Sala, data e horário são obrigatórios');
      }

      // Constrói dataHoraInicio e dataHoraFim a partir de data e hora
      // A reserva é sempre de 1 hora
      const dataHoraInicio = `${formData.data}T${formData.hora}:00`;
      const [hora, minuto] = formData.hora.split(':');
      const horaFim = String(parseInt(hora) + 1).padStart(2, '0');
      const dataHoraFim = `${formData.data}T${horaFim}:${minuto}:00`;

      const reserva: ReservaInput = {
        salaId: formData.salaId,
        dataHoraInicio,
        dataHoraFim,
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
      
      if (formData.salaId) reserva.salaId = formData.salaId;
      if (formData.local) reserva.local = formData.local;
      if (formData.sala) reserva.sala = formData.sala;
      
      // Se data e hora foram fornecidos, calcular dataHoraInicio e dataHoraFim
      if (formData.data && formData.hora) {
        const dataHoraInicio = `${formData.data}T${formData.hora}:00`;
        const [hora, minuto] = formData.hora.split(':');
        const horaFim = String(parseInt(hora) + 1).padStart(2, '0');
        const dataHoraFim = `${formData.data}T${horaFim}:${minuto}:00`;
        reserva.dataHoraInicio = dataHoraInicio;
        reserva.dataHoraFim = dataHoraFim;
      }
      
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

  const handleDelete = async (reservaId: string | number) => {
    try {
      const id = typeof reservaId === 'string' ? parseInt(reservaId) : reservaId;
      if (isNaN(id)) {
        throw new Error('ID de reserva inválido');
      }

      const { data } = await deleteReserva({
        variables: { reservaId: id },
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

