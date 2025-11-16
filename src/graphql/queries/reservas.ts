import { gql } from '@apollo/client';

export const GET_RESERVAS = gql`
  query GetReservas($skip: Int, $limit: Int) {
    reservas(skip: $skip, limit: $limit) {
      id
      local
      sala
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

export const GET_RESERVA = gql`
  query GetReserva($reservaId: Int!) {
    reserva(reservaId: $reservaId) {
      id
      local
      sala
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

