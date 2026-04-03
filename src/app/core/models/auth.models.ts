export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface LoginRequest {
  login: string;
  password: string;
}
