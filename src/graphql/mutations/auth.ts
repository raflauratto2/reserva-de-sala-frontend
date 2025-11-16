import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($loginData: LoginInput!) {
    login(loginData: $loginData) {
      accessToken
      tokenType
    }
  }
`;

export const CRIAR_USUARIO = gql`
  mutation CriarUsuario($usuario: UsuarioInput!) {
    criarUsuario(usuario: $usuario) {
      id
      username
      email
      createdAt
    }
  }
`;

