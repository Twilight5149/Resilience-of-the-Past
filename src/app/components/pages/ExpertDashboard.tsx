import { useState, useEffect } from "react";
import { Shield, CheckCircle, AlertCircle, Send, Loader2 } from "lucide-react";
import { fetchChurches, submitExpertRating, type Church } from "../../../services/churchAPI";

interface RatingHistory {
  id: string;
  church_id: string;
  churches: { name: string }; // For joined church name
  rating: number;
  assessment: string;
  recommendations: string;
  created_at: string;
}

export default function ExpertDashboard() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [history, setHistory] = useState<RatingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedChurch, setSelectedChurch] = useState("");
  const [rating, setRating] = useState(5);
  const [assessment, setAssessment] = useState("");
  const [recommendations, setRecommendations] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const churchData = await fetchChurches();
      setChurches(churchData);
      
      // Note: You might need a fetchExpertHistory() function in your API 
      // If not yet implemented, we'll focus on the submission first
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChurch || !assessment.trim() || !recommendations.trim()) return;

    try {
      setSubmitting(true);
      
      await submitExpertRating(
        selectedChurch,
        rating,
        assessment,
        recommendations
      );

      // Success Garnish
      alert("Structural assessment submitted and church status updated!");
      
      // Reset Form
      setSelectedChurch("");
      setRating(5);
      setAssessment("");
      setRecommendations("");
      
      // Refresh church list to see updated ratings
      loadData();
      
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingColor = (r: number) => {
    if (r >= 8) return "text-green-600";
    if (r >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingLabel = (r: number) => {
    if (r >= 9) return "Excellent";
    if (r >= 8) return "Very Good";
    if (r >= 7) return "Good";
    if (r >= 6) return "Fair";
    if (r >= 4) return "Needs Attention";
    return "Critical";
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Expert Dashboard</h1>
        <p className="text-gray-600">Provide verified structural integrity assessments</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-900">
            <strong>Verified Expert Status:</strong> Your assessments are marked as professional 
            audits and directly update the church safety ratings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <Shield className="w-6 h-6 text-blue-600" />
              Submit Structural Assessment
            </h2>

            <form onSubmit={handleSubmitRating} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Church
                </label>
                <select
                  value={selectedChurch}
                  onChange={(e) => setSelectedChurch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Choose a church from the database...</option>
                  {churches.map((church) => (
                    <option key={church.id} value={church.id}>
                      {church.name} — {church.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resilience Score (1-10)
                </label>
                <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="text-center min-w-[100px]">
                    <div className={`text-4xl font-black ${getRatingColor(rating)}`}>
                      {rating}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      {getRatingLabel(rating)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Technical Assessment Details
                </label>
                <textarea
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder="Analyze foundation, load-bearing walls, material decay, and historical wear..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preservation Recommendations
                </label>
                <textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="List priority repairs or maintenance required to maintain resilience..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {submitting ? "Processing Official Rating..." : "Publish Official Assessment"}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Guidelines */}
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              Scoring Rubric
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-yellow-200 pb-2">
                <span className="font-bold text-green-700">9-10</span>
                <span className="text-yellow-900">Structurally Sound</span>
              </div>
              <div className="flex justify-between border-b border-yellow-200 pb-2">
                <span className="font-bold text-yellow-600">6-8</span>
                <span className="text-yellow-900">Moderate Wear</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-red-600">1-5</span>
                <span className="text-yellow-900">Critical Failure Risk</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 text-white rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-3">Assessment Logic</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                Foundation Integrity
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                Load-bearing Resilience
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                Material Degradation
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                Environmental Impact
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}