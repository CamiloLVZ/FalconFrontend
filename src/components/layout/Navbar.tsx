import logo from "../../assets/logo/logo.jpg";
import { useState } from 'react';

export const Navbar = () => {
    const tabs = ['Book', 'Manage', 'Check-in', 'Status'];
    const [activeTab, setActiveTab] = useState('Book');

    return (
        <header className="bg-[#0B1C2C] text-white">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center cursor-pointer" onClick={()=> {}}>
                    <p className="text-3xl font-bold tracking-[.5em]">FALCON</p>
                    <img
                        src={logo}
                        alt="Falcon logo"
                        className="h-10 w-auto rounded-xl ml-2"
                    />

                </div>

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
