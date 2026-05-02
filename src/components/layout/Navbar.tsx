import { useState } from 'react';
import {Logo} from "../icons/Logo.tsx";

export const Navbar = () => {
    const tabs = ['Reservar', 'Gestionar', 'Check-in', 'Estado del vuelo'];
    const [activeTab, setActiveTab] = useState('Reservar');

    return (
        <header className="bg-[#0B1C2C] text-white">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                <Logo/>

                {/* Navigation */}
                <nav className="flex gap-8 text-sm font-medium cursor-pointer">
                    {tabs.map((tab) => (
                        <a
                            key={tab}
                            className={
                                activeTab === tab
                                    ? 'text-yellow-400 border-b-2 border-yellow-400 pb-1 text-lg'
                                    : 'hover:text-yellow-400 transition text-lg'
                            }
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </a>
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
