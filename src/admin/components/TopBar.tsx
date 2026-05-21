export const TopBar = () => {
  return (
    <header className="sticky top-0 z-20 h-[72px] border-b border-white/5 bg-[#21324a] text-slate-200">
      <div className="flex h-full items-center justify-between gap-5 px-5 sm:px-8 lg:pl-[350px] lg:pr-10">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <button className="grid h-11 w-11 place-items-center rounded-lg text-slate-300 transition hover:bg-white/8 hover:text-white">
            <span className="sr-only">Notificaciones</span>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22a2.4 2.4 0 0 0 2.3-1.8H9.7A2.4 2.4 0 0 0 12 22Zm7-5-1.6-2.1V10a5.4 5.4 0 0 0-4.2-5.3V3.8a1.2 1.2 0 1 0-2.4 0v.9A5.4 5.4 0 0 0 6.6 10v4.9L5 17v1.2h14V17Z" />
            </svg>
          </button>

          <button className="grid h-11 w-11 place-items-center rounded-lg text-slate-300 transition hover:bg-white/8 hover:text-white">
            <span className="sr-only">Configuración</span>
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="m19.4 13.5.1-1.5-.1-1.5 2-1.6-2-3.4-2.5 1a8.8 8.8 0 0 0-2.6-1.5L14 2.3h-4L9.6 5a8.8 8.8 0 0 0-2.6 1.5l-2.5-1-2 3.4 2 1.6-.1 1.5.1 1.5-2 1.6 2 3.4 2.5-1a8.8 8.8 0 0 0 2.6 1.5l.4 2.7h4l.4-2.7A8.8 8.8 0 0 0 17 17.5l2.5 1 2-3.4-2.1-1.6ZM12 15.4a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8Z" />
            </svg>
          </button>

          <button className="grid h-11 w-11 place-items-center rounded-lg text-slate-300 transition hover:bg-white/8 hover:text-white">
            <span className="sr-only">Data center</span>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h16v6H4V4Zm2 2v2h2V6H6Zm-2 8h16v6H4v-6Zm2 2v2h2v-2H6Z" />
            </svg>
          </button>

          <button className="ml-1 h-10 w-10 overflow-hidden rounded-full border border-[#ffb400]/70 bg-[#071c33]">
            <span className="grid h-full w-full place-items-center text-sm font-bold text-[#ffb400]">
              AD
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
