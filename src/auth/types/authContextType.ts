import type { AuthUser, LoginRequestDTO } from "./auth";

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (credentials: LoginRequestDTO) => Promise<void>;

  logout: () => void;
}
