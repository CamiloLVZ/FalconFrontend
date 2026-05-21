import { apiClient } from "../../../../api/axios";
import type {
  CreateAircraftDTO,
  UpdateAircraftCapacityDTO,
  CorrectIdentityAircraftDTO,
  AircraftType,
} from "../../../../types/aircraftType";

export const getAircrafts = async (): Promise<AircraftType[]> => {
  const response = await apiClient.get<AircraftType[]>("/v1/airplane-types");
  return response.data;
};

export const getAircraftById = async (id: number): Promise<AircraftType> => {
  const response = await apiClient.get<AircraftType>(
    `/v1/airplane-types/${id}`,
  );
  return response.data;
};

export const createAircraft = async (
  aircraftData: CreateAircraftDTO,
): Promise<AircraftType> => {
  const response = await apiClient.post<AircraftType>(
    "/v1/airplane-types",
    aircraftData,
  );
  return response.data;
};

export const updateAircraftCapacity = async (
  id: number,
  capacityData: UpdateAircraftCapacityDTO,
): Promise<AircraftType> => {
  const response = await apiClient.put<AircraftType>(
    `/v1/airplane-types/${id}`,
    capacityData,
  );
  return response.data;
};

export const updateAircraftIdentity = async (
  id: number,
  identityData: CorrectIdentityAircraftDTO,
): Promise<AircraftType> => {
  const response = await apiClient.put<AircraftType>(
    `/v1/airplane-types/${id}/correct-identity`,
    identityData,
  );
  return response.data;
};

export const activateAircraft = async (id: number): Promise<AircraftType> => {
  const response = await apiClient.put<AircraftType>(
    `/v1/airplane-types/${id}/activate`,
  );
  return response.data;
};

export const deactivateAircraft = async (id: number): Promise<AircraftType> => {
  const response = await apiClient.put<AircraftType>(
    `/v1/airplane-types/${id}/deactivate`,
  );
  return response.data;
};

export const retireAircraft = async (id: number): Promise<AircraftType> => {
  const response = await apiClient.put<AircraftType>(
    `/v1/airplane-types/${id}/retire`,
  );
  return response.data;
};
