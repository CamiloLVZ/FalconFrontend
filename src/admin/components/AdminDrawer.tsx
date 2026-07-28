import type { ReactNode } from "react";
import { useEffect } from "react";

interface AdminDrawerProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const AdminDrawer = ({ title, isOpen, onClose, children }: AdminDrawerProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md sm:max-w-md transform bg-white shadow-2xl transition-transform h-full flex flex-col">
        <div className="flex items-center justify-between border-b px-4 sm:px-6 py-4">
          <h2 className="text-lg sm:text-xl font-bold truncate pr-2">{title}</h2>
          <button 
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
