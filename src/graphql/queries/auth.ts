import { gql } from '@apollo/client';

export const MEU_PERFIL = gql`
  query MeuPerfil {
    meuPerfil {
      id
      username
      email
      admin
      createdAt
    }
  }
`;

