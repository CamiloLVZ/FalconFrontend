import type { FlightSeat } from "../../../types/seatMap";

interface SeatConfirmationModalProps {
  seat: FlightSeat;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export const SeatConfirmationModal = ({
  seat,
  onConfirm,
  onCancel,
  loading,
}: SeatConfirmationModalProps) => {
  const isFirstClass = seat.seatClass === "FIRST_CLASS";
  const classLabel = isFirstClass ? "Primera Clase" : "Económica";

  return (
    <div className="seat-confirm-panel">
      <div className="panel-header">
        <div className={`seat-icon ${isFirstClass ? "first-class" : "economy"}`}>
          {isFirstClass ? (
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          )}
        </div>
        <h3>Asiento {seat.label}</h3>
        <p>Confirma tu selección</p>
      </div>

      <div className="panel-details">
        <div className="detail-row">
          <span className="detail-label">Asiento</span>
          <span className="detail-value">{seat.label}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Clase</span>
          <span className="detail-value">{classLabel}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Precio</span>
          <span className="detail-value price">
            ${seat.price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="btn-confirm"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? "Procesando..." : "Confirmar asiento"}
      </button>

      <button
        type="button"
        className="btn-cancel"
        onClick={onCancel}
        disabled={loading}
      >
        Cancelar
      </button>
    </div>
  );
};
