import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Church, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient"; // Ensure this path is correct
import { useAuth } from "../../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<'user' | 'expert' | 'admin'>('user');
  const [error, setError] = useState<string | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState<"username" | "password" | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [loading, setLoading] = useState(false);

  const PROTECTED_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();

  const normalize = (value: string | null | undefined) => value?.trim().toLowerCase() || "";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Supabase Auth: Verifies if Email and Password exist/match
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      // 2. Admin Restriction Logic
      // If the email matches your specific admin email, but they didn't select 'admin' role
      if (PROTECTED_ADMIN_EMAIL && normalize(email) === PROTECTED_ADMIN_EMAIL) {
        if (accountType !== 'admin') {
          await supabase.auth.signOut(); // Log them out immediately
          setError("This account is restricted to Administrator access only.");
          setLoading(false);
          return;
        }
      }

      // 3. Optional: Verify role matches what's in your DB 'profiles' table
      // This prevents a regular user from simply selecting 'admin' in the dropdown
      const { data: profileById } = await supabase
        .from('profiles')
        .select('role,email,name,expertise,is_pending_expert')
        .eq('id', data.user.id)
        .maybeSingle();

      const { data: profileByEmail } = profileById
        ? { data: null }
        : await supabase
            .from('profiles')
            .select('role,email,name,expertise,is_pending_expert')
            .ilike('email', data.user.email || email.trim())
            .maybeSingle();

      const profile = profileById ?? profileByEmail;

      if (!profile) {
        await supabase.auth.signOut();
        setError("Access denied. Your username and email do not match a registered account.");
        setLoading(false);
        return;
      }

      const submittedUsername = normalize(username);
      const submittedEmail = normalize(email);
      const authEmail = normalize(data.user.email);
      const profileUsername = normalize(profile.name);
      const profileEmail = normalize(profile.email);

      if (!profileUsername || !profileEmail || profileUsername !== submittedUsername || profileEmail !== submittedEmail || authEmail !== submittedEmail) {
        await supabase.auth.signOut();
        setError("Access denied. Username, email, and password must match the same registered account.");
        setLoading(false);
        return;
      }

      const profileRole = String(profile?.role || "").toLowerCase();
      const isAdminProfile = Boolean(PROTECTED_ADMIN_EMAIL) && profileEmail === PROTECTED_ADMIN_EMAIL && profileRole === "admin";
      const isExpertProfile =
        profileRole === "expert" &&
        profile?.is_pending_expert !== true;

      if (accountType === "admin" && !isAdminProfile) {
        await supabase.auth.signOut();
        setError("Access denied. This account is not authorized for administrator access.");
        setLoading(false);
        return;
      }

      if (accountType === "expert" && !isExpertProfile) {
        await supabase.auth.signOut();
        setError("Access denied. This account is not registered for expert access.");
        setLoading(false);
        return;
      }

      if (accountType === "user" && profileRole === "admin") {
        await supabase.auth.signOut();
        setError("This account is restricted to Administrator access only.");
        setLoading(false);
        return;
      }

      await refreshUser();

      // 5. Navigate
      if (accountType === 'expert') {
        navigate("/expert-dashboard");
      } else if (accountType === 'admin') {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err: any) {
      // Handles "Invalid login credentials", "User not found", etc.
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const getRecoveryEmail = () => recoveryEmail.trim() || email.trim();

  const handleForgotUsername = async () => {
    setError(null);
    setRecoveryMessage(null);

    const lookupEmail = getRecoveryEmail();
    if (!lookupEmail) {
      setError("Enter your email address first so we can find your username.");
      return;
    }

    setRecoveryLoading("username");
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name,email")
        .ilike("email", lookupEmail)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile?.name) {
        setError("No username was found for that email address.");
        return;
      }

      setUsername(profile.name);
      setEmail(profile.email || lookupEmail);
      setRecoveryEmail(profile.email || lookupEmail);
      setRecoveryMessage(`Your username is ${profile.name}.`);
    } catch (err: any) {
      setError(err.message || "Unable to recover username right now.");
    } finally {
      setRecoveryLoading(null);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setRecoveryMessage(null);

    const resetEmail = getRecoveryEmail();
    if (!resetEmail) {
      setError("Enter your email address first so we can send a password reset link.");
      return;
    }

    setRecoveryLoading("password");
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setEmail(resetEmail);
      setRecoveryEmail(resetEmail);
      setRecoveryMessage("Password reset link sent. Check your email and open the link to set a new password.");
    } catch (err: any) {
      setError(err.message || "Unable to send password reset link right now.");
    } finally {
      setRecoveryLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Church className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {recoveryMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{recoveryMessage}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                disabled={loading}
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
              >
                <option value="user">Regular User</option>
                <option value="expert">Verified Expert</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  disabled={loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowRecovery((current) => !current)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                aria-expanded={showRecovery}
              >
                Forgot username or password?
              </button>
            </div>

            {showRecovery && (
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Recovery Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    disabled={loading || recoveryLoading !== null}
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="Use your registered email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                  />
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleForgotUsername}
                    disabled={loading || recoveryLoading !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {recoveryLoading === "username" ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                    Forgot username
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading || recoveryLoading !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {recoveryLoading === "password" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Forgot password
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
