import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  const email = String(user.email || "").trim().toLowerCase();
  const role = String(user.role || "").trim().toLowerCase();

  if (!ADMIN_EMAIL || email !== ADMIN_EMAIL || role !== "admin") return <Navigate to="/" replace />;

  return <>{children}</>;
};