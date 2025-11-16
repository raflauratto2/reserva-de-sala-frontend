export interface Sala {
  id: number;
  nome: string;
  local: string;
  capacidade?: number | null;
  descricao?: string | null;
  criadorId: number;
  ativa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalaInput {
  nome: string;
  local: string;
  capacidade?: number;
  descricao?: string;
}

export interface SalaUpdateInput {
  nome?: string;
  local?: string;
  capacidade?: number;
  descricao?: string;
  ativa?: boolean;
}

export interface SalaFormData {
  nome: string;
  local: string;
  capacidade?: number;
  descricao?: string;
}

