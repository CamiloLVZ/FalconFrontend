import type { Flight } from "../../../types/flight.ts";
import { formatDuration, getArrivalTime } from "../../../utils/date-times.ts";
import { AirplaneIcon } from "../../icons/AirplaneIcon.tsx";
import { AirplaneDepartureIcon } from "../../icons/AirplaneDepartureIcon.tsx";
import { AirplaneArrivalIcon } from "../../icons/AirplaneArrivalIcon.tsx";

interface Props {
  flight: Flight;
  onBook?: (flightId: number) => void;
}

export const FlightCard = ({ flight, onBook }: Props) => {
  const departureTime = flight.localDepartureDateTime.slice(11, 16);
  const arrivalTime = getArrivalTime(
    flight.localDepartureDateTime,
    flight.durationMinutes,
  );

  const handleBook = () => {
    onBook?.(flight.id);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition">
      <div className="flex items-center justify-between">
        {/* Departure */}
        <div className="text-center min-w-[60px]">
          <div className="flex justify-center mb-1 text-gray-400">
            <AirplaneDepartureIcon />
          </div>
          <p className="text-xl font-semibold">{departureTime}</p>
          <p className="text-base text-gray-800 bold">{flight.origin}</p>
        </div>

        {/* Middle */}
        <div className="flex-1 mx-6 text-center">
          <p className="text-xs text-gray-700 mb-1">
            {formatDuration(flight.durationMinutes)}
          </p>

          <div className="flex items-center">
            <div className="h-[2px] bg-gray-300 flex-1"></div>

            <span className="mx-2 rotate-45">
              <AirplaneIcon />
            </span>

            <div className="h-[2px] bg-gray-300 flex-1"></div>
          </div>

          <p className="text-xs text-gray-700 mt-1">Directo</p>
        </div>

        {/* Arrival */}
        <div className="text-center min-w-[60px]">
          <div className="flex justify-center mb-1 text-gray-400">
            <AirplaneArrivalIcon />
          </div>
          <p className="text-xl font-semibold">{arrivalTime}</p>
          <p className="text-base text-gray-800 bold">{flight.destination}</p>
        </div>
      </div>

      <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleBook}
          className="px-5 py-2 bg-yellow-400 text-black rounded-xl font-semibold text-sm hover:bg-yellow-300 transition cursor-pointer"
        >
          Reservar
        </button>
      </div>
    </div>
  );
};
