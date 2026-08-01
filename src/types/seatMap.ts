export type SeatStatus = "AVAILABLE" | "OCCUPIED";
export type SeatClass = "FIRST_CLASS" | "ECONOMY";

export interface FlightSeat {
  number: number;
  label: string;
  seatClass: SeatClass;
  status: SeatStatus;
  price: number;
}

export interface FlightSeatMap {
  seatColumns: string;
  firstClassRows: number;
  economyRows: number;
  priceEconomy: number;
  priceFirstClass: number;
  seats: FlightSeat[];
}
