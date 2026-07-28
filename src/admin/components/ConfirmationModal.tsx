import { AdminModal } from "./AdminModal";
import { FormError } from "./FormError";

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  error?: string | null;
  isSubmitting?: boolean;
}

export const ConfirmationModal = ({
  title,
  message,
  onConfirm,
  onCancel,
  error,
  isSubmitting,
}: ConfirmationModalProps) => {
  return (
    <AdminModal title={title}>
      <p className="mb-6">{message}</p>
      <FormError error={error} />
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Procesando..." : "Confirmar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
      </div>
    </AdminModal>
  );
};
