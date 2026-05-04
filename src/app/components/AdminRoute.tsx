import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

export const AdminRoute = () => {
  const { user, loading } = useAuth();

  console.log("Current User Role:", user?.role); // 🟢 CHECK YOUR CONSOLE (F12)

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};