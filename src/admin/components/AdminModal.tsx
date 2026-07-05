import type { ReactNode } from "react";

interface AdminModalProps {
  title: string;
  children: ReactNode;
}

export const AdminModal = ({ title, children }: AdminModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
};
