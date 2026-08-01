import { apiClient } from "../api/axios";
import type { Passenger, CreatePassengerRequest } from "../admin/features/passengers/types/passengerTypes";

export const getMyProfile = async (): Promise<Passenger> => {
  const response = await apiClient.get<Passenger>("/v1/passengers/me");
  return response.data;
};

export const createMyProfile = async (data: CreatePassengerRequest): Promise<Passenger> => {
  const response = await apiClient.post<Passenger>("/v1/passengers/me", data);
  return response.data;
};

export const updateMyProfile = async (data: CreatePassengerRequest): Promise<Passenger> => {
  const response = await apiClient.put<Passenger>("/v1/passengers/me", data);
  return response.data;
};
