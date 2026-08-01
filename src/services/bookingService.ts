import { apiClient } from "../api/axios";
import type { Flight } from "../types/flight";
import type { FlightQuote, PaymentRequestDto, PaymentResponse } from "../types/booking";

export const getFlightById = async (id: number): Promise<Flight> => {
  const response = await apiClient.get<Flight>(`/v1/flights/${id}`);
  return response.data;
};

export const getFlightQuote = async (id: number): Promise<FlightQuote> => {
  const response = await apiClient.get<FlightQuote>(`/v1/flights/${id}/quote`);
  return response.data;
};

export const processPayment = async (data: PaymentRequestDto): Promise<PaymentResponse> => {
  const response = await apiClient.post<PaymentResponse>("/v1/payments", data);
  return response.data;
};
