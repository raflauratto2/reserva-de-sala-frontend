import { gql } from '@apollo/client';

export const GET_RESERVAS = gql`
  query GetReservas {
    reservas {
      id
      local
      sala
      dataInicio
      dataFim
      responsavel
      cafe {
        quantidade
        descricao
      }
    }
  }
`;

export const GET_RESERVA = gql`
  query GetReserva($id: ID!) {
    reserva(id: $id) {
      id
      local
      sala
      dataInicio
      dataFim
      responsavel
      cafe {
        quantidade
        descricao
      }
    }
  }
`;

