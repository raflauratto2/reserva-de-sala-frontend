import { gql } from '@apollo/client';

export const GET_USUARIOS_NAO_ADMIN = gql`
  query GetUsuariosNaoAdmin($skip: Int, $limit: Int) {
    usuariosNaoAdmin(skip: $skip, limit: $limit) {
      id
      nome
      username
      email
    }
  }
`;

export const GET_PARTICIPANTES_RESERVA = gql`
  query GetParticipantesReserva($reservaId: Int!) {
    participantesReserva(reservaId: $reservaId) {
      id
      reservaId
      usuarioId
      notificado
      usuario {
        id
        nome
        username
        email
      }
      createdAt
    }
  }
`;

export const GET_MINHAS_RESERVAS_CONVIDADAS = gql`
  query GetMinhasReservasConvidadas($apenasNaoNotificadas: Boolean, $apenasNaoVistas: Boolean, $skip: Int, $limit: Int) {
    minhasReservasConvidadas(apenasNaoNotificadas: $apenasNaoNotificadas, apenasNaoVistas: $apenasNaoVistas, skip: $skip, limit: $limit) {
      id
      reservaId
      usuarioId
      notificado
      visto
      reserva {
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
        salaRel {
          id
          nome
          local
          capacidade
          descricao
        }
        cafeQuantidade
        cafeDescricao
        linkMeet
        createdAt
        updatedAt
      }
      createdAt
    }
  }
`;

export const CONTAR_RESERVAS_NAO_VISTAS = gql`
  query ContarReservasNaoVistas {
    contarReservasNaoVistas
  }
`;

export const GET_MEU_HISTORICO = gql`
  query GetMeuHistorico($apenasFuturas: Boolean, $apenasPassadas: Boolean, $skip: Int, $limit: Int) {
    meuHistorico(apenasFuturas: $apenasFuturas, apenasPassadas: $apenasPassadas, skip: $skip, limit: $limit) {
      reserva {
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
        salaRel {
          id
          nome
          local
          capacidade
          descricao
        }
        cafeQuantidade
        cafeDescricao
        linkMeet
        createdAt
        updatedAt
      }
      souResponsavel
    }
  }
`;

