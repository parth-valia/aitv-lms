// src/types/auth.ts
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar: {
    _id: string;
    localPath: string;
    url: string;
  };
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export type LoginForm = {
  email: string;
  password: string;
};
