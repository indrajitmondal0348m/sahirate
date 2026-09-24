import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser } from "@/services/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "RECYCLER" | "ADMIN";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const location = useLocation();
  const user = getStoredUser();

  // If not logged in at all, redirect to login page
  if (!user) {
    const loginQuery = requiredRole === "ADMIN" ? "?role=admin" : "?role=recycler";
    return <Navigate to={`/login${loginQuery}`} state={{ from: location }} replace />;
  }

  // If user is logged in but role doesn't match requiredRole
  if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
    // Recycler trying to access admin council
    return <Navigate to="/recycler" replace />;
  }

  return <>{children}</>;
}
