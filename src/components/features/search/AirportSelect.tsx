import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AirportSearchOption } from "../../../types/airport.ts";

interface Props {
  options: AirportSearchOption[];
  value: string;
  placeholder: string;
  icon: ReactNode;
  disabled?: boolean;
  onSelect: (airport: AirportSearchOption) => void;
}

export const AirportSelect = ({
  options,
  value,
  placeholder,
  icon,
  disabled = false,
  onSelect,
}: Props) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

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
        readOnly
        disabled={disabled}
        onFocus={() => {
          if (!disabled) {
            setShowDropdown(true);
          }
        }}
      />

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-300 rounded-xl shadow-lg z-50 overflow-hidden">
          {options.map((airport) => (
            <div
              key={airport.iataCode}
              onClick={() => {
                onSelect(airport);

                setShowDropdown(false);
              }}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
            >
              <p className="font-semibold">
                {airport.city} ({airport.iataCode})
              </p>

              <p className="text-sm text-gray-500">{airport.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
