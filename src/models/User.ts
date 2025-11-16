export interface User {
  id: number;
  nome?: string | null;
  username: string;
  email: string;
  admin: boolean;
  createdAt: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface CreateUsuarioInput {
  nome?: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

