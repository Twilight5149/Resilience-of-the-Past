import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles: ("admin" | "expert" | "member")[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // 1. Wait for AuthContext to finish checking the Supabase session
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // 2. If no user is found, send them to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If user role isn't in the allowed list, send them home/unauthorized
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 4. If all checks pass, render the child routes
  return <Outlet />;
};