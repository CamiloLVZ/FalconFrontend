import { createContext } from "react";
import type { AuthContextType } from "../types/authContextType";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
