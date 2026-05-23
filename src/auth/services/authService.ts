import { apiClient } from "../../api/axios";

import type { LoginRequestDTO, LoginResponseDTO } from "../types/auth";

export const loginUser = async (
  credentials: LoginRequestDTO,
): Promise<LoginResponseDTO> => {
  const response = await apiClient.post<LoginResponseDTO>(
    "/v1/auth/login",
    credentials,
  );

  return response.data;
};
