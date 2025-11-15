export interface Reserva {
  id: string;
  local: string;
  sala: string;
  dataInicio: string;
  dataFim: string;
  responsavel: string;
  cafe?: {
    quantidade: number;
    descricao: string;
  } | null;
}

export interface ReservaInput {
  local: string;
  sala: string;
  dataInicio: string;
  dataFim: string;
  responsavel: string;
  cafe?: {
    quantidade: number;
    descricao: string;
  } | null;
}

export interface ReservaFormData {
  local: string;
  sala: string;
  dataInicio: string;
  dataFim: string;
  responsavel: string;
  cafeQuantidade?: number;
  cafeDescricao?: string;
}

