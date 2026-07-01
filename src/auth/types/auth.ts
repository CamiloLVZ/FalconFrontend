export interface AuthUser {
  id: number;
  email: string;
  roles: string[];
}

/** LoginRequestDto */
export interface LoginRequest {
  email: string;
  password: string;
}

/** LoginResponseDto */
export interface LoginResponse {
  tokenType: string;
  accessToken: string;
}

/** CreateUserDto — used for register and register-admin */
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface JWTPayload {
  sub: number; // User ID
  email: string;
  roles: string[];
  iat: number; // Issued at
  exp: number; // Expiration time
}
