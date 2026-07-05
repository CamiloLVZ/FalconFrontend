interface FormActionsProps {
  cancelLabel?: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  submitLabel?: string;
  submittingLabel?: string;
}

export const FormActions = ({
  cancelLabel = "Cancelar",
  isSubmitting = false,
  onCancel,
  submitLabel = "Guardar",
  submittingLabel = "Guardando...",
}: FormActionsProps) => {
  return (
    <div className="mt-6 flex justify-end space-x-2">
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
      <button
        type="button"
        className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700"
        onClick={onCancel}
      >
        {cancelLabel}
      </button>
    </div>
  );
};
