import {Outlet} from "react-router-dom";
import {TopBar} from "../components/TopBar.tsx";
import {Sidebar} from "../components/Sidebar.tsx";

export const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-[#f7f5f6] text-[#070a10]">

            <TopBar/>
            <main className="px-5 py-8 sm:px-8 lg:pl-87.5 lg:pr-10">
                <Sidebar/>
                <Outlet/>
            </main>
        </div>
    );
};
