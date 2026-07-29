import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AirportSearchOption } from "../../../types/airportSearch.ts";

interface Props {
  options: AirportSearchOption[];
  value: string;
  placeholder: string;
  icon: ReactNode;
  disabled?: boolean;
  onSelect: (airport: AirportSearchOption) => void;
  onInputChange: (value: string) => void;
}

export const AirportSelect = ({
  options,
  value,
  placeholder,
  icon,
  disabled = false,
  onSelect,
  onInputChange,
}: Props) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (opt) =>
      opt.city.toLowerCase().includes(value.toLowerCase()) ||
      opt.iataCode.toLowerCase().includes(value.toLowerCase()) ||
      opt.name.toLowerCase().includes(value.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative flex items-center justify-between px-4 my-3 w-full"
    >
      {icon}

      <input
        type="text"
        placeholder={placeholder}
        className="focus:outline-none border-0 rounded-lg px-3 w-full bg-transparent disabled:cursor-not-allowed font-semibold"
        value={value}
        disabled={disabled}
        onChange={(e) => onInputChange(e.target.value)}
        onFocus={() => {
          if (!disabled) {
            setShowDropdown(true);
          }
        }}
      />

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((airport) => (
              <button
                key={airport.iataCode}
                type="button"
                onClick={() => {
                  onSelect(airport);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 cursor-pointer"
              >
                <p className="font-semibold">
                  {airport.city} ({airport.iataCode})
                </p>

                <p className="text-sm text-gray-500">{airport.name}</p>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center px-4 py-3">
              Sin resultados
            </p>
          )}
        </div>
      )}
    </div>
  );
};
