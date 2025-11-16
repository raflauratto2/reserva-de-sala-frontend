export interface Reserva {
  id: number;
  local: string;
  sala: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  responsavelId: number;
  cafeQuantidade?: number | null;
  cafeDescricao?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReservaInput {
  local: string;
  sala: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  cafeQuantidade?: number;
  cafeDescricao?: string;
}

export interface ReservaUpdateInput {
  local?: string;
  sala?: string;
  dataHoraInicio?: string;
  dataHoraFim?: string;
  cafeQuantidade?: number;
  cafeDescricao?: string;
}

export interface ReservaFormData {
  local: string;
  sala: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  cafeQuantidade?: number;
  cafeDescricao?: string;
}

