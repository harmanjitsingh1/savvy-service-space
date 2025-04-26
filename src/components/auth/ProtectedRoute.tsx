
import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  redirectPath?: string;
  children?: React.ReactNode;
  requiredRole?: "user" | "provider" | "admin";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = "/login",
  requiredRole,
  children,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect users to appropriate homepage based on role when they access root path
  useEffect(() => {
    if (isAuthenticated && !isLoading && location.pathname === "/") {
      // Only redirect providers away from root, let users stay
      if (user?.role === "provider") {
        navigate("/provider", { replace: true });
      }
      // No redirection for users - they can access the root path
    }
  }, [isAuthenticated, isLoading, user, location.pathname, navigate]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check if the route requires a specific role
  if (requiredRole && user?.role !== requiredRole) {
    // If user is provider but trying to access user routes, redirect to provider dashboard
    if (user?.role === "provider" && requiredRole === "user") {
      return <Navigate to="/provider" replace />;
    }
    // If user is regular user but trying to access provider routes, redirect to user dashboard
    if (user?.role === "user" && requiredRole === "provider") {
      return <Navigate to="/dashboard" replace />;
    }
    // For any other unauthorized role access
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
