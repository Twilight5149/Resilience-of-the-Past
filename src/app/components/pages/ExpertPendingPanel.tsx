import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Clock, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function ExpertPendingPanel() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [checking, setChecking] = useState(false);

  const checkApproval = async () => {
    try {
      setChecking(true);
      const latestUser = await refreshUser();
      const role = String(latestUser?.role || "").toLowerCase();
      const hasExpertApplication = Boolean(latestUser?.expertise) || role === "expert";
      const isApprovedExpert =
        hasExpertApplication &&
        latestUser?.is_pending_expert !== true;

      if (isApprovedExpert) navigate("/expert-dashboard", { replace: true });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkApproval();
    const interval = window.setInterval(checkApproval, 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const role = String(user?.role || "").toLowerCase();
    const hasExpertApplication = Boolean(user?.expertise) || role === "expert";

    if (hasExpertApplication && user?.is_pending_expert !== true) {
      navigate("/expert-dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-blue-600 animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">Your status is pending</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your expert application is currently being reviewed. Once an administrator approves your role, this page will send you to the expert panel for structural ratings.
        </p>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4 text-left mb-6">
          <Clock className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">Status</p>
            <p className="text-sm font-medium text-amber-700">
              {checking ? "Checking approval status..." : "Awaiting Admin Verification"}
            </p>
          </div>
        </div>

        <button
          onClick={checkApproval}
          disabled={checking}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-60 mb-4"
        >
          {checking && <Loader2 className="w-4 h-4 animate-spin" />}
          Check Status
        </button>

        <button 
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-gray-600 font-bold text-sm flex items-center justify-center gap-2 mx-auto"
        >
          <LogOut className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}