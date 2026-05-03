import { useState } from "react";
import { Logo } from "../icons/Logo.tsx";
import { NavLink } from "react-router-dom";

export const Navbar = () => {
  const tabs = [
    { label: "Reservar", path: "/" },
    { label: "Gestionar", path: "/booking" },
    { label: "Check-in", path: "/check-in" },
    { label: "Estado del vuelo", path: "/status" },
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
          <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-300 transition cursor-pointer text-lg">
            Login
          </button>
        </div>
      </div>
    </header>
  );
};
