import { gql } from '@apollo/client';

export const ATUALIZAR_PERFIL = gql`
  mutation AtualizarPerfil($usuario: UsuarioUpdateInput!) {
    atualizarPerfil(usuario: $usuario) {
      id
      nome
      username
      email
      admin
      createdAt
    }
  }
`;

