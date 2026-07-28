import { apiClient } from "../../../../api/axios";
import type {
  CreateAirplaneTypeRequest,
  ConfigureSeatsRequest,
  CorrectAirplaneTypeIdentityRequest,
  AirplaneType,
} from "../types/airplaneTypeTypes";

export const getAircrafts = async (): Promise<AirplaneType[]> => {
  const response = await apiClient.get<AirplaneType[]>("/v1/airplane-types");
  return response.data;
};

export const getAircraftById = async (id: number): Promise<AirplaneType> => {
  const response = await apiClient.get<AirplaneType>(
    `/v1/airplane-types/${id}`,
  );
  return response.data;
};

export const createAircraft = async (
  aircraftData: CreateAirplaneTypeRequest,
): Promise<AirplaneType> => {
  const response = await apiClient.post<AirplaneType>(
    "/v1/airplane-types",
    aircraftData,
  );
  return response.data;
};

export const updateAircraftCapacity = async (
  id: number,
  capacityData: ConfigureSeatsRequest,
): Promise<AirplaneType> => {
  const response = await apiClient.patch<AirplaneType>(
    `/v1/airplane-types/${id}/configure-seats`,
    capacityData,
  );
  return response.data;
};

export const updateAircraftIdentity = async (
  id: number,
  identityData: CorrectAirplaneTypeIdentityRequest,
): Promise<AirplaneType> => {
  const response = await apiClient.patch<AirplaneType>(
    `/v1/airplane-types/${id}/correct-identity`,
    identityData,
  );
  return response.data;
};

export const activateAircraft = async (id: number): Promise<AirplaneType> => {
  const response = await apiClient.patch<AirplaneType>(
    `/v1/airplane-types/${id}/activate`,
  );
  return response.data;
};

export const deactivateAircraft = async (id: number): Promise<AirplaneType> => {
  const response = await apiClient.patch<AirplaneType>(
    `/v1/airplane-types/${id}/deactivate`,
  );
  return response.data;
};

export const retireAircraft = async (id: number): Promise<AirplaneType> => {
  const response = await apiClient.patch<AirplaneType>(
    `/v1/airplane-types/${id}/retire`,
  );
  return response.data;
};
