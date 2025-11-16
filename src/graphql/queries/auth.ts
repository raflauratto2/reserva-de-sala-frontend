import { gql } from '@apollo/client';

export const MEU_PERFIL = gql`
  query MeuPerfil {
    meuPerfil {
      id
      nome
      username
      email
      admin
      createdAt
    }
  }
`;

