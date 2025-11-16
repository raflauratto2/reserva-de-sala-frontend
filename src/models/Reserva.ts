export interface Responsavel {
  id: number;
  nome?: string | null;
  username: string;
  email: string;
}

export interface Reserva {
  id: number;
  local?: string | null;
  sala?: string | null;
  salaId?: number | null;
  dataHoraInicio: string;
  dataHoraFim: string;
  responsavelId: number;
  responsavel?: Responsavel | null;
  cafeQuantidade?: number | null;
  cafeDescricao?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReservaInput {
  salaId?: number;
  local?: string;
  sala?: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  cafeQuantidade?: number;
  cafeDescricao?: string;
}

export interface ReservaUpdateInput {
  salaId?: number;
  local?: string;
  sala?: string;
  dataHoraInicio?: string;
  dataHoraFim?: string;
  cafeQuantidade?: number;
  cafeDescricao?: string;
}

export interface ReservaFormData {
  salaId?: number;
  local?: string;
  sala?: string;
  data: string;
  hora: string;
  cafeQuantidade?: number;
  cafeDescricao?: string;
}

