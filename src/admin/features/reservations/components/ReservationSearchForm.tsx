import type { FormEvent } from "react";

interface ReservationSearchFormProps {
  flightId: string;
  reservationNumberInput: string;
  loading: boolean;
  onFlightIdChange: (value: string) => void;
  onReservationNumberChange: (value: string) => void;
  onSearchByFlight: (e: FormEvent) => void;
  onSearchByNumber: (e: FormEvent) => void;
}

export const ReservationSearchForm = ({
  flightId,
  reservationNumberInput,
  loading,
  onFlightIdChange,
  onReservationNumberChange,
  onSearchByFlight,
  onSearchByNumber,
}: ReservationSearchFormProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
      <div className="grid gap-4 md:grid-cols-2">
        <form onSubmit={onSearchByFlight} className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label
              htmlFor="flightId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ID del Vuelo
            </label>
            <input
              type="text"
              id="flightId"
              value={flightId}
              onChange={(e) => onFlightIdChange(e.target.value)}
              placeholder="Ej: 123"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !flightId.trim()}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Buscar Reservas
          </button>
        </form>

        <form
          onSubmit={onSearchByNumber}
          className="flex gap-4 items-end"
        >
          <div className="flex-1 max-w-xs">
            <label
              htmlFor="reservationNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Número de Reserva
            </label>
            <input
              type="text"
              id="reservationNumber"
              value={reservationNumberInput}
              onChange={(e) => onReservationNumberChange(e.target.value)}
              placeholder="Ej: RES-1001"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !reservationNumberInput.trim()}
            className="px-6 py-2 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-900 disabled:opacity-50"
          >
            Buscar Reserva
          </button>
        </form>
      </div>
    </div>
  );
};
