import { useState } from "react";
import { Outlet } from "react-router-dom";
import { TopBar } from "../components/TopBar.tsx";
import { Sidebar } from "../components/Sidebar.tsx";

export const AdminLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f5f6] text-[#070a10]">
      <TopBar onMenuToggle={() => setMobileNavOpen(!mobileNavOpen)} />
      <main className="px-5 py-8 sm:px-8 lg:pl-87.5 lg:pr-10">
        <Sidebar
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
        <Outlet />
      </main>
    </div>
  );
};
