import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold mb-4">404</h1>

      <p className="text-lg text-gray-600 mb-6">
        La página que buscas no existe
      </p>

      <a className="bg-yellow-400 px-6 py-2 rounded-full font-semibold hover:bg-yellow-300 transition">
        <Link to="/">Volver al inicio</Link>
      </a>
    </div>
  );
};
