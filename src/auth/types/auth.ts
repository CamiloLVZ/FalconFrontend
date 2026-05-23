export interface AuthUser {
  id: number;
  email: string;
  roles: string[];
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  tokenType: string;
  accessToken: string;
}

export interface JWTPayload {
  sub: number; // User ID
  email: string;
  roles: string[];
  iat: number; // Issued at
  exp: number; // Expiration time
}
