import { Outlet, Link, useNavigate } from "react-router";
import { useState } from "react";
import { Church, LogOut, Menu, X, Shield, LayoutDashboard } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();

export default function Root() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isLoggedIn = Boolean(user);
  const userRole = String(user?.role || "user").toLowerCase();
  const userEmail = String(user?.email || "").trim().toLowerCase();
  const isAdmin = Boolean(ADMIN_EMAIL) && userEmail === ADMIN_EMAIL && userRole === "admin";
  const isExpert = userRole === "expert" || (Boolean(user?.expertise) && user?.is_pending_expert !== true);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
              <Church className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight">Resilience of The Past</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
              <Link to="/search" className="text-gray-600 hover:text-blue-600 font-medium">Search Churches</Link>

              {isLoggedIn ? (
                <>
                  <Link to="/dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  
                  {isExpert && (
                    <Link to="/expert-dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium">
                      <Shield className="w-4 h-4" />
                      Expert Panel
                    </Link>
                  )}
                  
                  {isAdmin && (
                    <Link to="/admin-dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-medium">
                      <Shield className="w-4 h-4 text-purple-600" />
                      Admin Panel
                    </Link>
                  )}

                  <div className="h-6 w-[1px] bg-gray-200 mx-2" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-bold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
                  <Link to="/signup" className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 font-bold shadow-md shadow-blue-200 transition-all">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 border-t border-gray-100 animate-in slide-in-from-top duration-200">
              <nav className="flex flex-col gap-4">
                <Link to="/" className="text-lg font-semibold text-gray-700" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/search" className="text-lg font-semibold text-gray-700" onClick={() => setMobileMenuOpen(false)}>Search Churches</Link>

                {isLoggedIn ? (
                  <>
                    <Link to="/dashboard" className="text-lg font-semibold text-gray-700" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                    {isExpert && (
                      <Link to="/expert-dashboard" className="text-lg font-semibold text-blue-600" onClick={() => setMobileMenuOpen(false)}>Expert Panel</Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin-dashboard" className="text-lg font-semibold text-purple-600" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-lg font-bold text-red-500 mt-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-lg font-semibold text-gray-700" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                    <Link to="/signup" className="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-center" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Pass the auth state down to all child routes */}
        <Outlet context={{ isLoggedIn, userRole }} />
      </main>

      <footer className="bg-slate-900 text-white mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 text-blue-400 mb-4">
                <Church className="w-6 h-6" />
                <span className="text-lg font-bold text-white">Resilience of The Past</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Protecting heritage through technology. We document church history and structural integrity 
                to ensure these monuments stand for generations.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Quick Navigation</h3>
              <ul className="space-y-3">
                <li><Link to="/search" className="text-slate-300 hover:text-white transition-colors">Search Inventory</Link></li>
                <li><Link to="/login" className="text-slate-300 hover:text-white transition-colors">Member Login</Link></li>
                <li><Link to="/signup" className="text-slate-300 hover:text-white transition-colors">Expert Registration</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">About the Project</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A specialized platform for architectural documentation and safety assessments 
                conducted by verified structural experts.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500 text-sm">
            <p>2026 Resilience of The Past. Built with Precision.</p>
             <p> Bohol Island State University Main Campus</p>
              <p>College of Engineering, Architecture and Industrial Design</p>
              <p>Computer Engineering Department</p>
              <p>Project in Database Management Systems</p>
             <p> Developed by Ryle Gerome Ocado BSCpE 2B</p>
             <p> Submitted to Engr. James Kenneth Almerol</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
