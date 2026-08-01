import { apiClient } from "../../../../api/axios";
import type { BoardingPassValidationResponse } from "../types/boardingTypes";

export const validateBoardingPass = async (
  qrToken: string,
): Promise<BoardingPassValidationResponse> => {
  const response = await apiClient.get<BoardingPassValidationResponse>(
    `/v1/boarding-passes/${qrToken}`,
  );
  return response.data;
};

export const boardPassengerViaQr = async (
  qrToken: string,
): Promise<void> => {
  await apiClient.patch(`/v1/boarding-passes/board/${qrToken}`);
};

export const downloadBoardingPass = async (
  passengerReservationId: number,
): Promise<void> => {
  const response = await apiClient.get(
    `/v1/boarding-passes/${passengerReservationId}/download`,
    { responseType: "blob" },
  );
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `boarding-pass-${passengerReservationId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
