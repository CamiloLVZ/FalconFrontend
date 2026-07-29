import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "../../components/icons/Logo.tsx";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems: NavItem[] = [
  {
    label: "AERONAVES",
    path: "/admin/aircraft",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 16.4v2.1L13.5 15v4.4l2 1.5v1.6L12 21.4l-3.5 1.1v-1.6l2-1.5V15L3 18.5v-2.1l7.5-5V6a1.5 1.5 0 0 1 3 0v5.4l7.5 5Z" />
      </svg>
    ),
  },
  {
    label: "AEROPUERTOS",
    path: "/admin/locations",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.5a7.5 7.5 0 0 0-7.5 7.5c0 5.6 7.5 11.5 7.5 11.5s7.5-5.9 7.5-11.5A7.5 7.5 0 0 0 12 2.5Zm0 10.1A2.6 2.6 0 1 1 12 7.4a2.6 2.6 0 0 1 0 5.2Z" />
      </svg>
    ),
  },
  {
    label: "RUTAS",
    path: "/admin/routes",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 5.5 10 3l4 2 5.1-2.2A1.3 1.3 0 0 1 21 4v14.5L15 21l-4-2-5.1 2.2A1.3 1.3 0 0 1 4 20V5.5Zm6 .2-4 1.6v11.1l4-1.7v-11Zm2 .1v11.4l3 1.5V7.3l-3-1.5Zm5 1.5v11l2-.8V5.9l-2 .9Z" />
      </svg>
    ),
  },
  {
    label: "VUELOS",
    path: "/admin/flights",
    icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 16.4v2.1L13.5 15v4.4l2 1.5v1.6L12 21.4l-3.5 1.1v-1.6l2-1.5V15L3 18.5v-2.1l7.5-5V6a1.5 1.5 0 0 1 3 0v5.4l7.5 5Z" />
        </svg>
    ),
  },
  {
    label: "GENERACIÓN DE VUELOS",
    path: "/admin/flight-generation",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="m12 1.8 1.7 5 5 .4-3.8 3.2 1.2 4.9-4.1-2.6-4.1 2.6 1.2-4.9-3.8-3.2 5-.4L12 1.8Zm7.4 11.8.8 2.4 2.4.2-1.8 1.5.6 2.4-2-1.3-2 1.3.6-2.4-1.8-1.5 2.4-.2.8-2.4ZM4.6 13.6l.8 2.4 2.4.2L6 17.7l.6 2.4-2-1.3-2 1.3.6-2.4-1.8-1.5 2.4-.2.8-2.4Z" />
      </svg>
    ),
  },
  {
    label: "RESERVAS",
    path: "/admin/reservations",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4.5h16a1.5 1.5 0 0 1 1.5 1.5v3.2a2.8 2.8 0 0 0 0 5.6V18a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18v-3.2a2.8 2.8 0 0 0 0-5.6V6A1.5 1.5 0 0 1 4 4.5Zm9 2v2h2v-2h-2Zm0 4.5v2h2v-2h-2Zm0 4.5v2h2v-2h-2Z" />
      </svg>
    ),
  },
  {
    label: "PASAJEROS",
    path: "/admin/passengers",
    icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.8 11.2a4.1 4.1 0 1 1 0-8.2 4.1 4.1 0 0 1 0 8.2Zm0 2c3.3 0 6.3 1.7 6.3 4.4v1.9H2.5v-1.9c0-2.7 3-4.4 6.3-4.4Zm7.4-1.5a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8Zm0 1.8c2.8 0 5.3 1.4 5.3 3.7v2.3h-4.4v-1.9c0-1.7-.9-3.1-2.4-4.1.5-.1 1-.1 1.5-.1Z" />
        </svg>
    ),
  },
  {
    label: "USUARIOS",
    path: "/admin/users",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
      </svg>
    ),
  },
  {
    label: "CHECK-IN",
    path: "/admin/checkin",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5L9 16.2Z" />
      </svg>
    ),
  },
  {
    label: "BOARDING",
    path: "/admin/boarding",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v3l10-5 10 5V7l-10-5zM2 17v3l10 5 10-5v-3L12 19l-10-5z" />
      </svg>
    ),
  },
];

export const Sidebar = ({ mobileOpen, onMobileClose }: SidebarProps) => {
  const sidebar = (
    <aside className="flex h-full w-[310px] flex-col bg-[#071c33] text-slate-100 shadow-2xl">
      <div className="flex h-[72px] items-center border-b border-white/5 px-7">
        <div className="text-3xl font-black tracking-[-0.08em] text-[#ffb400]">
          <Logo />
        </div>
      </div>

      <div className="px-7 pb-6 pt-7">
        <p className="text-xs font-bold uppercase tracking-[0.55em] text-slate-500">
          Fleet Control
        </p>
        <p className="mt-1 text-base font-semibold text-white">
          Global Operations
        </p>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              [
                "flex h-[59px] items-center gap-5 rounded-lg px-6 text-sm font-semibold tracking-[0.12em] transition",
                isActive
                  ? "bg-[#ffb400] text-[#061a31] shadow-lg shadow-amber-500/20"
                  : "text-slate-300 hover:bg-white/6 hover:text-white",
              ].join(" ")
            }
          >
            <span className="flex w-7 shrink-0 items-center justify-center">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        {sidebar}
      </div>

      {/* Mobile: overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm border-0 p-0 cursor-default"
            onClick={onMobileClose}
            aria-label="Cerrar menú"
            type="button"
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
};
