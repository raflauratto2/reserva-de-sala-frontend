import { gql } from '@apollo/client';

export const CREATE_RESERVA = gql`
  mutation CriarReserva($reserva: ReservaInput!) {
    criarReserva(reserva: $reserva) {
      id
      local
      sala
      salaId
      dataHoraInicio
      dataHoraFim
      responsavelId
      cafeQuantidade
      cafeDescricao
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_RESERVA = gql`
  mutation AtualizarReserva($reservaId: Int!, $reserva: ReservaUpdateInput!) {
    atualizarReserva(reservaId: $reservaId, reserva: $reserva) {
      id
      local
      sala
      salaId
      dataHoraInicio
      dataHoraFim
      responsavelId
      cafeQuantidade
      cafeDescricao
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_RESERVA = gql`
  mutation DeletarReserva($reservaId: Int!) {
    deletarReserva(reservaId: $reservaId)
  }
`;

