import { useQuery, useMutation } from '@apollo/client';
import { GET_USUARIOS_NAO_ADMIN, GET_PARTICIPANTES_RESERVA, GET_MINHAS_RESERVAS_CONVIDADAS, CONTAR_RESERVAS_NAO_VISTAS } from '@/graphql/queries/participantes';
import { ADICIONAR_PARTICIPANTE, REMOVER_PARTICIPANTE, MARCAR_RESERVA_COMO_NOTIFICADA, MARCAR_RESERVA_COMO_VISTA } from '@/graphql/mutations/participantes';
import { User } from '@/models/User';
import { useAuthStore } from '@/store/auth-store';

export interface Participante {
  id: number;
  reservaId: number;
  usuarioId: number;
  notificado: boolean;
  usuario?: User | null;
  createdAt: string;
}

export interface ReservaConvidada {
  id: number;
  reservaId: number;
  usuarioId: number;
  notificado: boolean;
  visto: boolean;
  reserva?: any;
  createdAt: string;
}

export const useUsuariosNaoAdmin = (skip = 0, limit = 100) => {
  const { data, loading, error, refetch } = useQuery(GET_USUARIOS_NAO_ADMIN, {
    variables: { skip, limit },
    errorPolicy: 'all',
  });

  return {
    usuarios: (data?.usuariosNaoAdmin || []) as User[],
    loading,
    error,
    refetch,
  };
};

export const useParticipantesReserva = (reservaId: number | null) => {
  const { data, loading, error, refetch } = useQuery(GET_PARTICIPANTES_RESERVA, {
    variables: { reservaId: reservaId || 0 },
    skip: !reservaId,
    errorPolicy: 'all',
  });

  return {
    participantes: (data?.participantesReserva || []) as Participante[],
    loading,
    error,
    refetch,
  };
};

export const useMinhasReservasConvidadas = (apenasNaoNotificadas = false, apenasNaoVistas = false, skip = 0, limit = 100) => {
  const { isAuthenticated } = useAuthStore();
  const { data, loading, error, refetch } = useQuery(GET_MINHAS_RESERVAS_CONVIDADAS, {
    skip: !isAuthenticated, // Só executa quando autenticado
    variables: { apenasNaoNotificadas, apenasNaoVistas, skip, limit },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network', // Busca da rede mesmo se tiver cache
    pollInterval: 30000, // Atualiza a cada 30 segundos
    notifyOnNetworkStatusChange: true, // Notifica quando a rede muda
  });

  return {
    reservasConvidadas: (data?.minhasReservasConvidadas || []) as ReservaConvidada[],
    loading,
    error,
    refetch,
  };
};

export const useContarReservasNaoVistas = () => {
  const { isAuthenticated } = useAuthStore();
  const { data, loading, error, refetch } = useQuery(CONTAR_RESERVAS_NAO_VISTAS, {
    skip: !isAuthenticated, // Só executa quando autenticado
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network', // Busca da rede mesmo se tiver cache
    pollInterval: 30000, // Atualiza a cada 30 segundos
    notifyOnNetworkStatusChange: true, // Notifica quando a rede muda
  });

  return {
    count: (data?.contarReservasNaoVistas || 0) as number,
    loading,
    error,
    refetch,
  };
};

export const useAdicionarParticipante = () => {
  const [mutation, { loading }] = useMutation(ADICIONAR_PARTICIPANTE);

  const handleAdd = async (reservaId: number, usuarioId: number) => {
    try {
      const { data, errors } = await mutation({
        variables: { reservaId, usuarioId },
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      return { success: true, data: data?.adicionarParticipante };
    } catch (err: any) {
      console.error('Erro ao adicionar participante:', err);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Erro ao adicionar participante';
      return { success: false, error: errorMessage };
    }
  };

  return { handleAdd, loading };
};

export const useRemoverParticipante = () => {
  const [mutation, { loading }] = useMutation(REMOVER_PARTICIPANTE);

  const handleRemove = async (reservaId: number, usuarioId: number) => {
    try {
      const { data, errors } = await mutation({
        variables: { reservaId, usuarioId },
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      return { success: data?.removerParticipante === true, error: data?.removerParticipante === false ? 'Erro ao remover participante' : undefined };
    } catch (err: any) {
      console.error('Erro ao remover participante:', err);
      const errorMessage = err.graphQLErrors?.[0]?.message || err.message || 'Erro ao remover participante';
      return { success: false, error: errorMessage };
    }
  };

  return { handleRemove, loading };
};

export const useMarcarReservaComoNotificada = () => {
  const [mutation, { loading }] = useMutation(MARCAR_RESERVA_COMO_NOTIFICADA);

  const handleMarcar = async (reservaId: number) => {
    try {
      const { data, errors } = await mutation({
        variables: { reservaId },
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      return { success: data?.marcarReservaComoNotificada === true };
    } catch (err: any) {
      console.error('Erro ao marcar reserva como notificada:', err);
      return { success: false, error: err.message || 'Erro ao marcar reserva como notificada' };
    }
  };

  return { handleMarcar, loading };
};

export const useMarcarReservaComoVista = () => {
  const [mutation, { loading }] = useMutation(MARCAR_RESERVA_COMO_VISTA);

  const handleMarcar = async (reservaId: number) => {
    try {
      const { data, errors } = await mutation({
        variables: { reservaId },
      });

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      return { success: data?.marcarReservaComoVista === true };
    } catch (err: any) {
      console.error('Erro ao marcar reserva como vista:', err);
      return { success: false, error: err.message || 'Erro ao marcar reserva como vista' };
    }
  };

  return { handleMarcar, loading };
};

