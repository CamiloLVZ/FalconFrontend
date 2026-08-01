import { Logo } from "../icons/Logo.tsx";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";

const TABS = [
  { label: "Reservar", path: "/" },
  { label: "Gestionar", path: "/manage" },
  { label: "Check-in", path: "/check-in" },
  { label: "Abordaje", path: "/boarding" },
];

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.roles.includes("ADMIN");
  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true, state: null });
  };

  return (
    <header className="bg-[#0B1C2C] text-white sticky top-0 z-20 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />

        {/* Navigation */}
        <nav className="flex gap-8 text-sm font-medium">
          {TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === "/"}
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-400 border-b-2 border-yellow-400 pb-1 text-lg transition-all duration-200"
                  : "hover:text-yellow-400 transition text-lg"
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                /* Admin badge — bordered with grid icon */
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "border-slate-500 text-slate-200 hover:border-yellow-400 hover:text-yellow-400"
                    }`
                  }
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.75"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  <span>Panel Admin</span>
                </NavLink>
              ) : (
                /* Profile pill — avatar initial + email */
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2.5 border px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? "bg-white/10 border-yellow-400 text-yellow-400"
                        : "border-slate-600 text-slate-200 hover:border-slate-400 hover:text-white"
                    }`
                  }
                >
                  <span className="w-6 h-6 rounded-full bg-yellow-400 text-black text-xs font-bold flex items-center justify-center select-none flex-shrink-0">
                    {initial}
                  </span>
                  <span className="max-w-[140px] truncate">{user?.email}</span>
                </NavLink>
              )}

              {/* Logout — arrow-right-from-door icon */}
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-600 text-slate-400 hover:border-rose-500 hover:text-rose-400 transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.75"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="block rounded-lg bg-yellow-400 px-4 py-2 text-lg font-medium text-black transition hover:bg-yellow-300"
            >
              Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};
