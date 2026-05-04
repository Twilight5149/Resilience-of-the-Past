import { Outlet, Link, useNavigate } from "react-router";
import { useState } from "react";
import { Church, LogOut, User, Menu, X } from "lucide-react";

export default function Root() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'expert' | 'admin'>('user');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <Church className="w-8 h-8" />
              <span className="text-xl font-bold">Resilience of The Past</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
              <Link to="/search" className="text-gray-700 hover:text-blue-600">Search Churches</Link>

              {isLoggedIn ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                  {userRole === 'expert' && (
                    <Link to="/expert-dashboard" className="text-gray-700 hover:text-blue-600">Expert Panel</Link>
                  )}
                  {userRole === 'admin' && (
                    <Link to="/admin-dashboard" className="text-gray-700 hover:text-blue-600">Admin Panel</Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                  <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col gap-4">
                <Link to="/" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/search" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Search Churches</Link>

                {isLoggedIn ? (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                    {userRole === 'expert' && (
                      <Link to="/expert-dashboard" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Expert Panel</Link>
                    )}
                    {userRole === 'admin' && (
                      <Link to="/admin-dashboard" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                    <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center" onClick={() => setMobileMenuOpen(false)}>
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
        <Outlet context={{ isLoggedIn, setIsLoggedIn, userRole, setUserRole }} />
      </main>

      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Resilience of The Past</h3>
              <p className="text-gray-400">Preserving and sharing the rich history of churches worldwide.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/search" className="text-gray-400 hover:text-white">Search Churches</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white">Login</Link></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">About</h3>
              <p className="text-gray-400">A platform for documenting church history, architecture, and structural integrity assessments by verified experts.</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Resilience of The Past. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
