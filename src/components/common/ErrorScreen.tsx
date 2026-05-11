interface ErrorScreenProps {
  message?: string;
}

export const ErrorScreen = ({
  message = "No hay resultados",
}: ErrorScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-6">
      {/* Error icon */}
      <div className="relative">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-12 h-12 text-red-600"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </div>
      </div>

      {/* Error message */}
      <div className="text-center flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
        <p className="text-gray-500 max-w-md">
          Parece que no encontramos lo que buscas. Intenta ajustar tus criterios
          de búsqueda.
        </p>
      </div>

      {/* Decorative elements */}
      <div className="flex gap-2 mt-4">
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
};
