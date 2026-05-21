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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-96 rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        {error && (
          <div className="mt-4 rounded-md bg-red-100 border border-red-300 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Confirmar"}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
