interface FormErrorProps {
  error?: string | null;
}

export const FormError = ({ error }: FormErrorProps) => {
  if (!error) return null;

  return (
    <div className="mt-4 rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-700">
      {error}
    </div>
  );
};
