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
