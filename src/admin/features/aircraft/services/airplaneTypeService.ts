import { apiClient } from "../../../../api/axios";
import type {
  AirplaneType,
  CreateAirplaneTypeRequest,
  UpdateAirplaneTypeCapacityRequest,
  CorrectAirplaneTypeIdentityRequest,
} from "../types/airplaneTypeTypes";

export const getAllAirplaneTypes = async (): Promise<AirplaneType[]> => {
  const response = await apiClient.get<AirplaneType[]>("/v1/airplane-types");
  return response.data;
};

export const getAirplaneTypeById = async (id: number): Promise<AirplaneType> => {
  const response = await apiClient.get<AirplaneType>(`/v1/airplane-types/${id}`);
  return response.data;
};

export const createAirplaneType = async (
  data: CreateAirplaneTypeRequest,
): Promise<AirplaneType> => {
  const response = await apiClient.post<AirplaneType>("/v1/airplane-types", data);
  return response.data;
};

export const updateAirplaneTypeCapacity = async (
  id: number,
  data: UpdateAirplaneTypeCapacityRequest,
): Promise<AirplaneType> => {
  const response = await apiClient.patch<AirplaneType>(`/v1/airplane-types/${id}`, data);
  return response.data;
};

export const correctAirplaneTypeIdentity = async (
  id: number,
  data: CorrectAirplaneTypeIdentityRequest,
): Promise<AirplaneType> => {
  const response = await apiClient.patch<AirplaneType>(
    `/v1/airplane-types/${id}/correct-identity`,
    data,
  );
  return response.data;
};

export const activateAirplaneType = async (id: number): Promise<AirplaneType> => {
  const response = await apiClient.patch<AirplaneType>(`/v1/airplane-types/${id}/activate`);
  return response.data;
};

export const deactivateAirplaneType = async (id: number): Promise<AirplaneType> => {
  const response = await apiClient.patch<AirplaneType>(`/v1/airplane-types/${id}/deactivate`);
  return response.data;
};

export const retireAirplaneType = async (id: number): Promise<AirplaneType> => {
  const response = await apiClient.patch<AirplaneType>(`/v1/airplane-types/${id}/retire`);
  return response.data;
};
