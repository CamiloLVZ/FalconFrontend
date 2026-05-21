import { Navbar } from "../components/common/Navbar.tsx";
import { Footer } from "../components/common/Footer.tsx";
import {Outlet} from "react-router-dom";

export const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};