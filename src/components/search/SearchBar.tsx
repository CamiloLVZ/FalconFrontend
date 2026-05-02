import {useState} from "react";
import {AirplaneDepartureIcon} from "../icons/AirplaneDepartureIcon.tsx";
import {AirplaneArrivalIcon} from "../icons/AirplaneArrivalIcon.tsx";

interface Props {
    onSearch: (filters: {
        origin: string;
        destination: string;
        date: string;
    }) => void;
}

export const SearchBar = ({onSearch}: Props) => {
    const [filters, setFilters] = useState({
        origin: "",
        destination: "",
        date: "",
    });

    return (
        <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col md:flex-row gap-4 items-stretch">

            <div className="rounded-xl border border-gray-300 flex pl-1 pr-4">
                <div className="flex items-center justify-between px-4 my-3">
                    <AirplaneDepartureIcon/>
                    <input
                        type="text"
                        placeholder="Origen"
                        className="focus:outline-none border-0 rounded-lg px-3 w-full"
                        value={filters.origin}
                        onChange={(e) =>
                            setFilters({...filters, origin: e.target.value})
                        }
                    />
                </div>

                <div className="flex items-center justify-between my-2 px-4 border-l-[0.001rem] border-gray-300">
                    <AirplaneArrivalIcon/>
                    <input
                        type="text"
                        placeholder="Destino"
                        className="focus:outline-none border-0 rounded-lg px-3 w-full"
                        value={filters.destination}
                        onChange={(e) =>
                            setFilters({...filters, destination: e.target.value})
                        }
                    />

                </div>

            </div>

            <div className="flex-2 w-full">
                <input
                    type="date"
                    onClick={(e) => e.target.showPicker()}
                    className="rounded-xl border border-gray-300 w-full px-4 py-3 cursor-pointer"
                    value={filters.date}
                    onChange={(e) =>
                        setFilters({...filters, date: e.target.value})
                    }
                />
            </div>
            <button
                onClick={() => onSearch(filters)}
                className="bg-yellow-400 text-black px-6 py-2 rounded-3xl font-semibold hover:bg-yellow-300 transition h-fit w-fit md:w-auto cursor-pointer flex-1"
            >
                <p className="text-[20px]">Buscar</p>
            </button>
        </div>
    );
};