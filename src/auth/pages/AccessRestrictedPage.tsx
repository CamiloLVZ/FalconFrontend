import { Link, useNavigate } from "react-router-dom";
import bgImage from "../../assets/backgrounds/sky-background.png";
import { Logo } from "../../components/icons/Logo";
import { useAuth } from "../hooks/useAuth";

export const AccessRestrictedPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleChangeAccount = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#071c33] px-4 py-10 text-white sm:px-6 lg:px-8">
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#071c33]/80" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col items-center justify-center text-center">
        <Logo />
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/95 px-6 py-10 text-[#071c33] shadow-2xl sm:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-yellow-500">
            Acceso restringido
          </p>
          <h1 className="mt-4 text-3xl font-bold">No tienes permisos</h1>
          <p className="mt-4 max-w-xl text-slate-600">
            Tu sesión está activa, pero tu usuario no tiene el rol ADMIN
            requerido para entrar al panel administrativo.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="rounded-lg bg-yellow-400 px-5 py-3 font-bold text-[#071c33] transition hover:bg-yellow-300"
            >
              Volver al inicio
            </Link>
            <button
              type="button"
              onClick={handleChangeAccount}
              className="rounded-lg border border-slate-300 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Cambiar de cuenta
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
