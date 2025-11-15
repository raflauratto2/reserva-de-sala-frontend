import { gql } from '@apollo/client';

export const CREATE_RESERVA = gql`
  mutation CreateReserva($input: ReservaInput!) {
    createReserva(input: $input) {
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

export const UPDATE_RESERVA = gql`
  mutation UpdateReserva($id: ID!, $input: ReservaInput!) {
    updateReserva(id: $id, input: $input) {
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

export const DELETE_RESERVA = gql`
  mutation DeleteReserva($id: ID!) {
    deleteReserva(id: $id)
  }
`;

