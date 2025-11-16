import { gql } from '@apollo/client';

export const GET_RESERVAS = gql`
  query GetReservas($skip: Int, $limit: Int) {
    reservas(skip: $skip, limit: $limit) {
      id
      local
      sala
      salaId
      dataHoraInicio
      dataHoraFim
      responsavelId
      responsavel {
        id
        nome
        username
        email
      }
      cafeQuantidade
      cafeDescricao
      linkMeet
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
      salaId
      dataHoraInicio
      dataHoraFim
      responsavelId
      responsavel {
        id
        nome
        username
        email
      }
      cafeQuantidade
      cafeDescricao
      linkMeet
      createdAt
      updatedAt
    }
  }
`;

export const GET_HORARIOS_DISPONIVEIS_POR_HORA = gql`
  query GetHorariosDisponiveisPorHora(
    $salaId: Int!
    $data: String!
    $horaInicio: String
    $horaFim: String
  ) {
    horariosDisponiveisPorHora(
      salaId: $salaId
      data: $data
      horaInicio: $horaInicio
      horaFim: $horaFim
    )
  }
`;

export const GET_RESERVAS_POR_SALA = gql`
  query GetReservasPorSala($salaId: Int!, $data: String!, $skip: Int, $limit: Int) {
    reservasPorSala(salaId: $salaId, data: $data, skip: $skip, limit: $limit) {
      id
      local
      sala
      salaId
      dataHoraInicio
      dataHoraFim
      responsavelId
      responsavel {
        id
        nome
        username
        email
      }
      cafeQuantidade
      cafeDescricao
      linkMeet
      createdAt
      updatedAt
    }
  }
`;
