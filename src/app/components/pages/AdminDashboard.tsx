import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, Shield, Church as ChurchIcon, FileText, Settings, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { fetchChurches, type Church } from "../../../services/churchAPI";
import { fetchUsers, type User } from "../../../services/userAPI";
import { approveExpert } from "../../../services/adminAPI"; // Assuming you added this to your services

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]); 
  const [churches, setChurches] = useState<Church[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // Keep your pending experts state, but we'll update it from the DB
  const [pendingExperts, setPendingExperts] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [churchData, userData] = await Promise.all([
        fetchChurches(),
        fetchUsers()
      ]);
      setChurches(churchData);
      setUsers(userData);
      
      // Filter users who have the 'is_pending_expert' flag set to true in Supabase
      const pending = userData.filter(u => u.is_pending_expert === true && u.role !== 'expert');
      setPendingExperts(pending);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  const handleApproveExpert = async (userId: string) => {
    try {
      setIsProcessing(userId);
      await approveExpert(userId);
      
      // Update local state for immediate feedback
      setPendingExperts(prev => prev.filter(e => e.id !== userId));
      
      // Refresh user list to show the new 'expert' count
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      
      alert("User promoted to Expert successfully!");
    } catch (error) {
      alert("Failed to approve expert status.");
    } finally {
      setIsProcessing(null);
    }
  };

  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalExperts = users.filter(u => u.role === 'expert').length;
  const pendingCount = pendingExperts.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, experts, and platform content</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Users</h3>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{totalUsers}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Verified Experts</h3>
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{totalExperts}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Churches</h3>
            <ChurchIcon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{churches.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending</h3>
            <FileText className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{pendingCount}</p>
        </div>
      </div>

      {/* CHURCH MANAGEMENT BANNER */}
      <div className="bg-slate-900 rounded-2xl shadow-lg p-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Church Data Management</h2>
            <p className="text-slate-400">Review, modify, or add new historical sites to the database.</p>
          </div>
          <Link
            to="/church-management"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
          >
            <Settings className="w-5 h-5" />
            Launch Manager
          </Link>
        </div>
      </div>

      {/* VERIFICATION REQUESTS */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-gray-800">
          <Shield className="w-6 h-6 text-blue-600" />
          Expert Verification Requests
        </h2>

        {pendingExperts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-1">Queue Clear</h3>
            <p className="text-gray-500">No pending expert applications found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingExperts.map((expert) => (
              <div key={expert.id} className="flex flex-col md:flex-row items-center justify-between p-6 border border-gray-100 rounded-2xl bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5 mb-4 md:mb-0">
                   <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xl font-black">
                     {expert.name.charAt(0)}
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-gray-900">{expert.name}</h3>
                     <p className="text-sm text-gray-500 font-medium">{expert.email}</p>
                     <p className="text-xs text-blue-600 font-bold uppercase mt-1 tracking-wider">{expert.expertise || 'Structural Engineer'}</p>
                   </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleApproveExpert(expert.id)}
                    disabled={isProcessing === expert.id}
                    className="flex-1 md:flex-none bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {isProcessing === expert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Verify Professional
                  </button>
                  <button
                    className="flex-1 md:flex-none bg-white text-gray-400 border border-gray-200 px-6 py-2.5 rounded-xl hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECENT ACTIVITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User List */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Active Directory</h2>
          <div className="divide-y divide-gray-50">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {user.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{user.name}</h3>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                  user.role === 'expert' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Church List */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Site Inventory</h2>
          <div className="divide-y divide-gray-50">
            {churches.slice(0, 5).map((church) => (
              <div key={church.id} className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{church.name}</h3>
                  <p className="text-xs text-gray-500">{church.city}, {church.province}</p>
                </div>
                {church.structuralRating ? (
                  <div className="text-right">
                    <span className="text-sm font-black text-blue-600">{church.structuralRating}/10</span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Safety Index</p>
                  </div>
                ) : (
                  <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-1 rounded font-bold">UNRATED</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}