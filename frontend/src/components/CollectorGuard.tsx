import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCollectorAuthStore } from "@/stores/authStore";

export default function CollectorGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, user } = useCollectorAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/collector/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
