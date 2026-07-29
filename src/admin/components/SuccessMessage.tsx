import { useEffect } from "react";

interface SuccessMessageProps {
  message: string | null;
  onDismiss: () => void;
}

export const SuccessMessage = ({ message, onDismiss }: SuccessMessageProps) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="rounded-md border border-green-300 bg-green-100 p-3 text-sm text-green-700 flex items-center justify-between">
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-2 shrink-0 rounded-full p-1 text-green-600 hover:bg-green-200"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  );
};
