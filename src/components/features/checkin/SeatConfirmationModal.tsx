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
          {isFirstClass ? "👑" : "💺"}
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
        className="btn-confirm"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? "Procesando..." : "Confirmar asiento"}
      </button>

      <button
        className="btn-cancel"
        onClick={onCancel}
        disabled={loading}
      >
        Cancelar
      </button>
    </div>
  );
};
