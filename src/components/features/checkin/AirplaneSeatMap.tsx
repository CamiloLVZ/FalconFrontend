import { useState } from "react";
import type { FlightSeatMap, FlightSeat, SeatClass } from "../../../types/seatMap";
import { SeatConfirmationModal } from "./SeatConfirmationModal";
import "./AirplaneSeatMap.css";

interface AirplaneSeatMapProps {
  seatMap: FlightSeatMap;
  passengerClass: SeatClass;
  onSeatConfirmed: (seatNumber: number) => void;
  loading: boolean;
}

/**
 * Computes aisle positions from seatColumns length.
 * Groups seats in blocks of 3. For 6 columns (ABCDEF) → aisle after index 3.
 * For 9 columns (ABCDEFGHI) → aisles after index 3 and 6.
 * For columns not divisible by 3 → single aisle at the midpoint.
 */
const getAislePositions = (columnCount: number): Set<number> => {
  const aisles = new Set<number>();
  if (columnCount <= 3) return aisles;

  if (columnCount % 3 === 0) {
    for (let i = 3; i < columnCount; i += 3) {
      aisles.add(i);
    }
  } else {
    const mid = Math.ceil(columnCount / 2);
    aisles.add(mid);
  }
  return aisles;
};

export const AirplaneSeatMap = ({
  seatMap,
  passengerClass,
  onSeatConfirmed,
  loading,
}: AirplaneSeatMapProps) => {
  const [selectedSeat, setSelectedSeat] = useState<FlightSeat | null>(null);

  const { seatColumns, firstClassRows, economyRows, seats } = seatMap;
  const colCount = seatColumns.length;
  const totalRows = firstClassRows + economyRows;
  const aislePositions = getAislePositions(colCount);

  // Organize seats into rows
  const rows: FlightSeat[][] = [];
  for (let r = 0; r < totalRows; r++) {
    const rowSeats = seats.slice(r * colCount, (r + 1) * colCount);
    rows.push(rowSeats);
  }

  const getSeatState = (seat: FlightSeat): string => {
    if (seat.status === "OCCUPIED") return "occupied";
    if (seat.seatClass !== passengerClass) return "disabled-class";
    if (selectedSeat?.number === seat.number) return "selected";
    return "available";
  };

  const handleSeatClick = (seat: FlightSeat) => {
    const state = getSeatState(seat);
    if (state === "occupied" || state === "disabled-class") return;
    setSelectedSeat(seat.number === selectedSeat?.number ? null : seat);
  };

  const handleConfirm = () => {
    if (selectedSeat) {
      onSeatConfirmed(selectedSeat.number);
    }
  };

  // Build column header row with aisles
  const columnHeaderElements: React.ReactNode[] = [];
  for (let c = 0; c < colCount; c++) {
    if (aislePositions.has(c)) {
      columnHeaderElements.push(
        <div key={`aisle-h-${c}`} className="column-header-aisle" />
      );
    }
    columnHeaderElements.push(
      <div key={`col-${c}`} className="column-header-letter">
        {seatColumns[c]}
      </div>
    );
  }

  return (
    <div className="seat-selection-layout">
      <div className="seat-map-container">
        <div className="airplane-fuselage">
          {/* Cockpit */}
          <div className="cockpit-header">
            <h3>Cabina</h3>
          </div>

          {/* Column headers */}
          <div className="column-headers">
            <div className="row-number" />
            {columnHeaderElements}
          </div>

          {/* First Class section */}
          {firstClassRows > 0 && (
            <>
              <div className="seat-section-label first-class">
                <span>Primera Clase</span>
              </div>
              {rows.slice(0, firstClassRows).map((rowSeats, rowIdx) => (
                <div key={`fc-row-${rowIdx}`} className="seat-row first-class-row">
                  <div className="row-number">{rowIdx + 1}</div>
                  {rowSeats.map((seat, colIdx) => {
                    const state = getSeatState(seat);
                    return (
                      <SeatButton
                        key={seat.number}
                        seat={seat}
                        state={state}
                        colIdx={colIdx}
                        aislePositions={aislePositions}
                        onClick={() => handleSeatClick(seat)}
                      />
                    );
                  })}
                </div>
              ))}
            </>
          )}

          {/* Class separator */}
          {firstClassRows > 0 && economyRows > 0 && <hr className="class-separator" />}

          {/* Economy section */}
          {economyRows > 0 && (
            <>
              <div className="seat-section-label economy">
                <span>Clase Económica</span>
              </div>
              {rows.slice(firstClassRows).map((rowSeats, rowIdx) => (
                <div key={`ec-row-${rowIdx}`} className="seat-row">
                  <div className="row-number">{firstClassRows + rowIdx + 1}</div>
                  {rowSeats.map((seat, colIdx) => {
                    const state = getSeatState(seat);
                    return (
                      <SeatButton
                        key={seat.number}
                        seat={seat}
                        state={state}
                        colIdx={colIdx}
                        aislePositions={aislePositions}
                        onClick={() => handleSeatClick(seat)}
                      />
                    );
                  })}
                </div>
              ))}
            </>
          )}

          {/* Legend */}
          <div className="seat-legend">
            {passengerClass === "ECONOMY" ? (
              <div className="legend-item">
                <div className="legend-swatch economy-swatch" />
                Disponible
              </div>
            ) : (
              <div className="legend-item">
                <div className="legend-swatch first-class-swatch" />
                Disponible
              </div>
            )}
            <div className="legend-item">
              <div className="legend-swatch selected-swatch" />
              Seleccionado
            </div>
            <div className="legend-item">
              <div className="legend-swatch occupied-swatch" />
              Ocupado
            </div>
            <div className="legend-item">
              <div className="legend-swatch disabled-swatch" />
              No disponible
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation panel or placeholder */}
      {selectedSeat ? (
        <SeatConfirmationModal
          seat={selectedSeat}
          onConfirm={handleConfirm}
          onCancel={() => setSelectedSeat(null)}
          loading={loading}
        />
      ) : (
        <div className="panel-placeholder">
          <div className="panel-placeholder-inner">
            <div className="placeholder-icon flex items-center justify-center text-slate-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p>Selecciona un asiento para ver los detalles</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Helper component: individual seat button ── */
interface SeatButtonProps {
  seat: FlightSeat;
  state: string;
  colIdx: number;
  aislePositions: Set<number>;
  onClick: () => void;
}

const SeatButton = ({ seat, state, colIdx, aislePositions, onClick }: SeatButtonProps) => {
  const isFirstClass = seat.seatClass === "FIRST_CLASS";
  const classStyle = isFirstClass ? "first-class" : "economy";
  const isClickable = state === "available" || state === "selected";

  return (
    <>
      {aislePositions.has(colIdx) && <div className="seat-aisle" />}
      <button
        type="button"
        className={`seat-btn ${state} ${classStyle}`}
        onClick={onClick}
        disabled={!isClickable}
        title={
          state === "occupied"
            ? "Asiento ocupado"
            : state === "disabled-class"
              ? "No disponible para tu clase"
              : `${seat.label} - $${seat.price.toLocaleString("es-CO")}`
        }
      >
        <span className="seat-label">{seat.label}</span>
        {isClickable && (
          <span className="seat-price">${Math.round(seat.price)}</span>
        )}
      </button>
    </>
  );
};
