import { gql } from '@apollo/client';

// Query para buscar usuário por ID (se disponível no backend)
export const GET_USUARIO = gql`
  query GetUsuario($usuarioId: Int!) {
    usuario(usuarioId: $usuarioId) {
      id
      nome
      username
      email
    }
  }
`;

// Query para listar usuários (se disponível no backend)
export const GET_USUARIOS = gql`
  query GetUsuarios($skip: Int, $limit: Int) {
    usuarios(skip: $skip, limit: $limit) {
      id
      nome
      username
      email
    }
  }
`;

