import { gql } from '@apollo/client';

export const ADICIONAR_PARTICIPANTE = gql`
  mutation AdicionarParticipante($reservaId: Int!, $usuarioId: Int!) {
    adicionarParticipante(reservaId: $reservaId, usuarioId: $usuarioId) {
      id
      reservaId
      usuarioId
      notificado
      usuario {
        id
        nome
        username
        email
      }
      createdAt
    }
  }
`;

export const REMOVER_PARTICIPANTE = gql`
  mutation RemoverParticipante($reservaId: Int!, $usuarioId: Int!) {
    removerParticipante(reservaId: $reservaId, usuarioId: $usuarioId)
  }
`;

export const MARCAR_RESERVA_COMO_NOTIFICADA = gql`
  mutation MarcarReservaComoNotificada($reservaId: Int!) {
    marcarReservaComoNotificada(reservaId: $reservaId)
  }
`;

export const MARCAR_RESERVA_COMO_VISTA = gql`
  mutation MarcarReservaComoVista($reservaId: Int!) {
    marcarReservaComoVista(reservaId: $reservaId)
  }
`;

