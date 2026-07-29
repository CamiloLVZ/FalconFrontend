const DEFAULT_SEAT_COLUMNS = "ABCDEF";

export const getSeatLabel = (seatNumber: number, seatColumns?: string): string => {
  const cols = seatColumns || DEFAULT_SEAT_COLUMNS;
  const seatsPerRow = cols.length;
  const row = Math.floor((seatNumber - 1) / seatsPerRow) + 1;
  const column = cols.charAt((seatNumber - 1) % seatsPerRow);
  return `${row}${column}`;
};
