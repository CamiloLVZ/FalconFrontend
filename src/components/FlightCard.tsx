import type { Flight } from "../types/flight";
import { formatDuration, getArrivalTime } from "../utils/date-times";
import { AirplaneIcon } from "../components/icons/AirplaneIcon";
import { AirplaneDepartureIcon } from "./icons/AirplaneDepartureIcon";
import { AirplaneArrivalIcon } from "./icons/AirplaneArrivalIcon";

interface Props {
  flight: Flight;
}

const statusStyles: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export const FlightCard = ({ flight }: Props) => {
  const departureTime = flight.localDepartureDateTime.slice(11, 16);
  const arrivalTime = getArrivalTime(
    flight.localDepartureDateTime,
    flight.durationMinutes,
  );

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition">
      {/* Main row */}
      <div className="flex items-center justify-between">
        {/* Departure */}
        <div className="text-center min-w-[60px]">
          <div className="flex justify-center mb-1 text-gray-400">
            <AirplaneDepartureIcon />
          </div>
          <p className="text-xl font-semibold">{departureTime}</p>
          <p className="text-xs text-gray-500">{flight.origin}</p>
        </div>

        {/* Middle */}
        <div className="flex-1 mx-6 text-center">
          <p className="text-xs text-gray-500 mb-1">
            {formatDuration(flight.durationMinutes)}
          </p>

          <div className="flex items-center">
            <div className="h-[2px] bg-gray-300 flex-1"></div>

            <span className="mx-2 rotate-45">
              <AirplaneIcon />
            </span>

            <div className="h-[2px] bg-gray-300 flex-1"></div>
          </div>

          <p className="text-xs text-gray-400 mt-1">Directo</p>
        </div>

        {/* Arrival */}
        <div className="text-center min-w-[60px]">
          <div className="flex justify-center mb-1 text-gray-400">
            <AirplaneArrivalIcon />
          </div>
          <p className="text-xl font-semibold">{arrivalTime}</p>
          <p className="text-xs text-gray-500">{flight.destination}</p>
        </div>
      </div>
    </div>
  );
};
