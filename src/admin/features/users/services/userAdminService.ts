import { apiClient } from "../../../../api/axios";
import type { PagedResponse } from "../../../../types/pagedResponse";
import type { Reservation } from "../../reservations/types/reservationTypes";
import type { AdminUser, UpdateUserCredentials } from "../types/userTypes";

export const getAdminUsers = async (
  page: number,
  size: number,
  email?: string,
  disabled?: boolean,
  role?: string,
): Promise<PagedResponse<AdminUser>> => {
  const response = await apiClient.get<PagedResponse<AdminUser>>(
    "/v1/admin/users",
    {
      params: { page, size, email: email || undefined, disabled, role: role || undefined },
    },
  );
  return response.data;
};

export const getUserReservations = async (
  userId: number,
  page: number,
  size: number,
  status?: string,
): Promise<PagedResponse<Reservation>> => {
  const response = await apiClient.get<PagedResponse<Reservation>>(
    `/v1/admin/users/${userId}/reservations`,
    {
      params: { page, size, status: status || undefined },
    },
  );
  return response.data;
};

export const updateUserCredentials = async (
  userId: number,
  data: UpdateUserCredentials,
): Promise<void> => {
  await apiClient.patch(`/v1/admin/users/${userId}/credentials`, data);
};

export const toggleUserDisabled = async (userId: number): Promise<void> => {
  await apiClient.patch(`/v1/admin/users/${userId}/toggle-disabled`);
};
