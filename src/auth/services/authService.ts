import { apiClient } from "../../api/axios";
import type { LoginRequest, LoginResponse, RegisterRequest } from "../types/auth";

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/v1/auth/login", credentials);
  return response.data;
};

export const registerUser = async (data: RegisterRequest): Promise<void> => {
  await apiClient.post("/v1/auth/register", data);
};

export const registerAdmin = async (data: RegisterRequest): Promise<void> => {
  await apiClient.post("/v1/auth/register-admin", data);
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await apiClient.post("/v1/auth/password-reset/request", { email });
};

export const resetPassword = async (code: string, password: string): Promise<void> => {
  await apiClient.post("/v1/auth/password-reset", { code, password });
};
