import { gql } from '@apollo/client';

export const CREATE_SALA = gql`
  mutation CriarSala($sala: SalaInput!) {
    criarSala(sala: $sala) {
      id
      nome
      local
      capacidade
      descricao
      criadorId
      ativa
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SALA = gql`
  mutation AtualizarSala($salaId: Int!, $sala: SalaUpdateInput!) {
    atualizarSala(salaId: $salaId, sala: $sala) {
      id
      nome
      local
      capacidade
      descricao
      criadorId
      ativa
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SALA = gql`
  mutation DeletarSala($salaId: Int!) {
    deletarSala(salaId: $salaId)
  }
`;

