import type { AircraftType } from "../../../../types/aircraftType";

export const aircraftMocks: AircraftType[] = [
  {
    id: 1,
    producer: "AIRBUS",
    model: "320-300NEO",
    economySeats: 120,
    firstClassSeats: 25,
    status: "ACTIVE",
  },
  {
    id: 2,
    producer: "BOEING",
    model: "787-8",
    economySeats: 280,
    firstClassSeats: 45,
    status: "ACTIVE",
  },
  {
    id: 3,
    producer: "BOEING",
    model: "727-400",
    economySeats: 120,
    firstClassSeats: 5,
    status: "RETIRED",
  },
  {
    id: 4,
    producer: "BOEING",
    model: "737-400",
    economySeats: 120,
    firstClassSeats: 0,
    status: "ACTIVE",
  },
];
