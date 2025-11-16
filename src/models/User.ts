export interface User {
  id: number;
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
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

