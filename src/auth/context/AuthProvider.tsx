import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AuthContext } from "./AuthContext";

import type { AuthUser, LoginRequestDTO } from "../types/auth";

import type { AuthContextType } from "../types/authContextType";

import { loginUser } from "../services/authService";

import { decodeJWT, isTokenExpired } from "../utils/tokens.utils";

import { AUTH_TOKEN_KEY } from "../constants/auth.constants";

interface Props {
  children: ReactNode;
}

const getStoredSession = (): {
  token: string | null;
  user: AuthUser | null;
} => {
  const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!storedToken) {
    return { token: null, user: null };
  }

  if (isTokenExpired(storedToken)) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return { token: null, user: null };
  }

  try {
    return {
      token: storedToken,
      user: decodeJWT(storedToken),
    };
  } catch (error) {
    console.error("Error restoring session:", error);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }: Props) => {
  const [storedSession] = useState(getStoredSession);

  const [user, setUser] = useState<AuthUser | null>(storedSession.user);

  const [token, setToken] = useState<string | null>(storedSession.token);

  const login = async (credentials: LoginRequestDTO): Promise<void> => {
    const response = await loginUser(credentials);

    const accessToken = response.accessToken;

    if (isTokenExpired(accessToken)) {
      throw new Error("Received expired token");
    }

    const decodedUser = decodeJWT(accessToken);

    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);

    setToken(accessToken);
    setUser(decodedUser);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);

    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,

      login,
      logout,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
