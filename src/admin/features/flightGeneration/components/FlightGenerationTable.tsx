import type { FlightGeneration } from "../types/flightGenerationTypes";

interface FlightGenerationTableProps {
  generations: FlightGeneration[];
  onViewDetails?: (generation: FlightGeneration) => void;
}

export const FlightGenerationTable = ({
  generations,
  onViewDetails,
}: FlightGenerationTableProps) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 border-b text-gray-700">
          <tr>
            <th className="px-6 py-4 font-semibold">ID</th>
            <th className="px-6 py-4 font-semibold">Tipo</th>
            <th className="px-6 py-4 font-semibold">Ruta</th>
            <th className="px-6 py-4 font-semibold">Generados</th>
            <th className="px-6 py-4 font-semibold">Estado</th>
            <th className="px-6 py-4 font-semibold">Inicio</th>
            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {generations.map((gen) => (
            <tr
              key={gen.generationId}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {gen.generationId}
              </td>
              <td className="px-6 py-4">{gen.type}</td>
              <td className="px-6 py-4">{gen.routeId || "-"}</td>
              <td className="px-6 py-4">{gen.totalGenerated ?? "-"}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    gen.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : gen.status === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {gen.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {new Date(gen.startedAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right">
                {onViewDetails && (
                  <button
                    type="button"
                    onClick={() => onViewDetails(gen)}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 border border-gray-200 text-sm font-medium"
                  >
                    Detalles
                  </button>
                )}
              </td>
            </tr>
          ))}
          {generations.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No hay generaciones registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
