import type { Airport } from "../types/airportTypes";

interface AirportTableProps {
  airports: Airport[];
  onEdit?: (airport: Airport) => void;
}

export const AirportTable = ({ airports, onEdit }: AirportTableProps) => {
  return (
    <table className="min-w-full divide-y divide-gray-200 rounded-lg bg-white shadow-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Codigo IATA
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Nombre
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Ciudad
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Pais
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Timezone
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {airports.map((airport) => (
          <tr key={airport.iataCode} className="hover:bg-gray-50">
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
              {airport.iataCode}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {airport.name}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {airport.city}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {airport.country.name}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
              {airport.timezone}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
              <button
                onClick={() => onEdit?.(airport)}
                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 border border-gray-200 text-sm font-medium"
              >
                Ver
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
