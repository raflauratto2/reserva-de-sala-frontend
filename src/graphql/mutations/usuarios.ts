import { gql } from '@apollo/client';

export const CRIAR_USUARIO_ADMIN = gql`
  mutation CriarUsuarioAdmin($usuario: UsuarioAdminInput!) {
    criarUsuarioAdmin(usuario: $usuario) {
      id
      nome
      username
      email
      admin
      createdAt
    }
  }
`;

export const ATUALIZAR_USUARIO_ADMIN = gql`
  mutation AtualizarUsuarioAdmin($usuarioId: Int!, $usuario: UsuarioAdminUpdateInput!) {
    atualizarUsuarioAdmin(usuarioId: $usuarioId, usuario: $usuario) {
      id
      nome
      username
      email
      admin
      createdAt
    }
  }
`;

export const DELETAR_USUARIO = gql`
  mutation DeletarUsuario($usuarioId: Int!) {
    deletarUsuario(usuarioId: $usuarioId)
  }
`;

