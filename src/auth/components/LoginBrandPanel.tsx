import { Logo } from "../../components/icons/Logo";

export const LoginBrandPanel = () => {
  return (
    <div className="hidden min-h-[520px] flex-col justify-between rounded-l-2xl bg-[#071c33]/95 p-10 text-white lg:flex">
      <Logo />

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.45em] text-yellow-400">
          Falcon Airways
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight">
          Gestiona tus viajes con una experiencia más clara.
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
          Accede a tu cuenta para consultar vuelos, administrar reservas y
          continuar con tus operaciones.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg border border-white/10 bg-white/6 p-4">
          <p className="text-2xl font-bold text-yellow-400">24/7</p>
          <p className="mt-1 text-slate-300">Soporte</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/6 p-4">
          <p className="text-2xl font-bold text-yellow-400">+120</p>
          <p className="mt-1 text-slate-300">Rutas</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/6 p-4">
          <p className="text-2xl font-bold text-yellow-400">100%</p>
          <p className="mt-1 text-slate-300">Online</p>
        </div>
      </div>
    </div>
  );
};
