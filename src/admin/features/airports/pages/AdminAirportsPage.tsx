import { useEffect, useMemo, useState } from "react";
import { AirportTable } from "../components/AirportTable";
import type { Airport } from "../types/AirportTypes";
import { getAllAirports } from "../services/airportService";
import { ErrorScreen } from "../../../../components/common/ErrorScreen";
import { LoadingScreen } from "../../../../components/common/LoadingScreen";
import { getAirportFieldValue } from "../utils/airport.utils";
import type { FilterField } from "../utils/airport.utils";
import { Pagination } from "../../../components/Pagination";

export const AdminAirportsPage = () => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<FilterField>("iataCode");

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAirports = async (page: number, size: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAirports(size, page);
      setAirports(data.content);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error(err);
      setError(
        "No se han podido cargar los aeropuertos. Por favor, inténtalo de nuevo más tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAirports(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Volver a la primera página al cambiar el tamaño
  };

  // El filtro se aplica sobre los registros de la página actual
  const filteredAirports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return [...airports].sort((a, b) => a.iataCode.localeCompare(b.iataCode));

    return airports
      .filter((airport) =>
        getAirportFieldValue(airport, filterField)
          .toLowerCase()
          .includes(search),
      )
      .sort((a, b) => a.iataCode.localeCompare(b.iataCode));
  }, [airports, searchTerm, filterField]);

  if (error) {
    return (
      <ErrorScreen messageTitle="Error al cargar aeropuertos" message={error} />
    );
  }

  return (
    <section className="min-h-[calc(100vh-136px)]">
      <h1 className="text-2xl font-bold">Airports</h1>

      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <select
          value={filterField}
          onChange={(e) => {
            setFilterField(e.target.value as FilterField);
            setSearchTerm("");
          }}
          className="rounded-lg border px-4 py-2"
        >
          <option value="iataCode">IATA</option>
          <option value="name">Nombre del Aeropuerto</option>
          <option value="city">Ciudad</option>
          <option value="country">País</option>
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Buscar por ${filterField}…`}
          className="flex-1 rounded-lg border px-4 py-2"
        />
      </div>

      {searchTerm.trim() && (
        <p className="mt-1 text-xs text-amber-600">
          ⚠ El filtro aplica sobre los {pageSize} registros de esta página. Cambia de página para buscar en otros registros.
        </p>
      )}

      <div className="mt-1 text-sm text-gray-500">
        {filteredAirports.length} aeropuertos en esta página
      </div>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <LoadingScreen />
        ) : (
          <AirportTable airports={filteredAirports} />
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </section>
  );
};
