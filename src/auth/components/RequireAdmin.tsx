import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AccessRestrictedPage } from "../pages/AccessRestrictedPage";
import { useAuth } from "../hooks/useAuth";

interface RequireAdminProps {
  children: ReactNode;
}

export const RequireAdmin = ({ children }: RequireAdminProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user?.roles.includes("ADMIN")) {
    return <AccessRestrictedPage />;
  }

  return children;
};
