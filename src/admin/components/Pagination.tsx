interface PaginationProps {
  currentPage: number;        // 0-indexed (como lo maneja el backend)
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const Pagination = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  const firstElement = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const lastElement = Math.min((currentPage + 1) * pageSize, totalElements);

  // Genera el rango de páginas a mostrar (máx 5 botones)
  const getPageRange = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const range: (number | "...")[] = [];

    if (currentPage <= 3) {
      range.push(0, 1, 2, 3, 4, "...", totalPages - 1);
    } else if (currentPage >= totalPages - 4) {
      range.push(
        0,
        "...",
        totalPages - 5,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
      );
    } else {
      range.push(
        0,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages - 1,
      );
    }

    return range;
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      {/* Registros por página */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Mostrar</span>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
          }}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span>registros por página</span>
      </div>

      {/* Info de registros */}
      <span className="text-sm text-gray-500">
        {totalElements === 0
          ? "Sin resultados"
          : `Mostrando ${firstElement}–${lastElement} de ${totalElements}`}
      </span>

      {/* Botones de páginas */}
      <div className="flex items-center gap-1">
        {/* Primera página */}
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          title="Primera página"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          «
        </button>

        {/* Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          title="Página anterior"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ‹
        </button>

        {/* Números de página */}
        {getPageRange().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex h-8 w-8 items-center justify-center text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors ${
                page === currentPage
                  ? "border-blue-600 bg-blue-600 font-semibold text-white"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page + 1}
            </button>
          ),
        )}

        {/* Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          title="Página siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ›
        </button>

        {/* Última página */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          title="Última página"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          »
        </button>
      </div>
    </div>
  );
};
