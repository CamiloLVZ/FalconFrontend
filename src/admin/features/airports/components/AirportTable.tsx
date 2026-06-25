import type { Airport } from "../types/AirportTypes";

interface AirportTableProps {
  airports: Airport[];
}

export const AirportTable = ({ airports }: AirportTableProps) => {
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
          </tr>
        ))}
      </tbody>
    </table>
  );
};
