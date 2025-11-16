import { gql } from '@apollo/client';

export const GET_SALAS = gql`
  query GetSalas($skip: Int, $limit: Int, $apenasAtivas: Boolean) {
    salas(skip: $skip, limit: $limit, apenasAtivas: $apenasAtivas) {
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

export const GET_SALA = gql`
  query GetSala($salaId: Int!) {
    sala(salaId: $salaId) {
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

export const GET_MINHAS_SALAS = gql`
  query GetMinhasSalas($skip: Int, $limit: Int) {
    minhasSalas(skip: $skip, limit: $limit) {
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

