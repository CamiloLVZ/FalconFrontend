import { Logo } from "../icons/Logo.tsx";
import { NavLink } from "react-router-dom";

export const Navbar = () => {
  const tabs = [
    { label: "Reservar", path: "/" },
    { label: "Gestionar", path: "/manage" },
    { label: "Check-in", path: "/check-in" },
    { label: "Abordaje", path: "/boarding" },
  ];

  return (
    <header className="bg-[#0B1C2C] text-white sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />

        {/* Navigation */}
        <nav className="flex gap-8 text-sm font-medium">
          {tabs.map((tab) => (
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
        <div>
          <NavLink
            to="/login"
            className="block rounded-lg bg-yellow-400 px-4 py-2 text-lg font-medium text-black transition hover:bg-yellow-300"
          >
            Login
          </NavLink>
        </div>
      </div>
    </header>
  );
};
