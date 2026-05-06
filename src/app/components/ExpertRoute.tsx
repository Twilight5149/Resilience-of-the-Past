import { Navigate } from "react-router";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ExpertPendingPanel from "../components/pages/ExpertPendingPanel";

export function ExpertRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <ShieldCheck className="h-8 w-8 animate-pulse text-blue-600" />
          </div>
          <h1 className="mb-2 text-2xl font-black text-gray-900">Checking expert access</h1>
          <p className="text-sm leading-relaxed text-gray-500">
            We are loading your approval status. Approved experts will be sent to the structural rating panel.
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  const role = String(user.role || "").toLowerCase();
  const hasExpertApplication = Boolean(user.expertise) || role === "expert";

  if (user.is_pending_expert === true) return <ExpertPendingPanel />;

  if (hasExpertApplication) return <>{children}</>;

  return <Navigate to="/" />;
}