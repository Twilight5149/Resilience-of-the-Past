import { useState, useEffect } from "react";
import { Shield, AlertCircle, Send, Loader2} from "lucide-react";
import { fetchChurches, submitExpertRating, type Church } from "../../../services/churchAPI";

const conditionLevels = [
  { value: 1, label: "Good", detail: "No significant defects" },
  { value: 2, label: "Fair", detail: "Minor defects observed" },
  { value: 3, label: "Poor", detail: "Moderate deterioration" },
  { value: 4, label: "Very Poor", detail: "Serious defects present" },
  { value: 5, label: "Dilapidated", detail: "Severe structural concern" },
];

const priorityLevels = [
  { value: 1, label: "Normal" },
  { value: 2, label: "Routine" },
  { value: 3, label: "Urgent" },
  { value: 4, label: "Emergency" },
];

export default function ExpertDashboard() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- CSP1 Matrix Form State ---
  const [selectedChurch, setSelectedChurch] = useState("");
  const [csp1Matrix, setCsp1Matrix] = useState({ conditionScore: 1, priorityScore: 1 });
  const [assessment, setAssessment] = useState("");
  const [recommendations, setRecommendations] = useState("");

  const { conditionScore, priorityScore } = csp1Matrix;
  const finalScore = conditionScore * priorityScore;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const churchData = await fetchChurches();
      setChurches(churchData);
    } catch (error) {
      console.error("Failed to load data:", error);
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
        conditionScore,
        priorityScore,
        assessment,
        recommendations
      );

      alert("CSP1 Matrix Assessment Published Successfully!");
      setSelectedChurch("");
      setCsp1Matrix({ conditionScore: 1, priorityScore: 1 });
      setAssessment("");
      setRecommendations("");
      loadData();
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Logic for CSP1 Visualization ---
  const getActionLevel = (score: number) => {
    if (score >= 13) return { label: "EMERGENCY/RED", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
    if (score >= 5) return { label: "CONDITION MONITORING", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
    return { label: "PLANNED MAINTENANCE", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
  };

  const selectedActionLevel = getActionLevel(finalScore);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Expert Dashboard</h1>
        <p className="text-gray-600">Building Condition Survey Protocol (CSP1) Implementation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="text-blue-600" /> Structural Audit Matrix
            </h2>

            <form onSubmit={handleSubmitRating} className="space-y-6">
              {/* Church Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2">Target Church</label>
                <select
                  value={selectedChurch}
                  onChange={(e) => setSelectedChurch(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  required
                >
                  <option value="">Select Church...</option>
                  {churches.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* CSP1 Matrix */}
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full min-w-[640px] border-collapse bg-white text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="w-56 px-4 py-3 text-left font-black uppercase tracking-wider">Condition</th>
                      {priorityLevels.map((priority) => (
                        <th key={priority.value} className="px-3 py-3 text-center">
                          <span className="block text-xs font-black uppercase">{priority.label}</span>
                          <span className="text-[10px] text-slate-300">P{priority.value}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {conditionLevels.map((condition) => (
                      <tr key={condition.value} className="border-t border-gray-100">
                        <th className="bg-gray-50 px-4 py-3 text-left align-middle">
                          <span className="block font-bold text-gray-900">C{condition.value}: {condition.label}</span>
                          <span className="block text-xs font-normal text-gray-500">{condition.detail}</span>
                        </th>
                        {priorityLevels.map((priority) => {
                          const score = condition.value * priority.value;
                          const actionLevel = getActionLevel(score);
                          const isSelected = conditionScore === condition.value && priorityScore === priority.value;

                          return (
                            <td key={priority.value} className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => setCsp1Matrix({ conditionScore: condition.value, priorityScore: priority.value })}
                                className={`h-16 w-full rounded-xl border-2 text-sm font-black transition-all ${actionLevel.bg} ${actionLevel.color} ${
                                  isSelected
                                    ? `${actionLevel.border} ring-4 ring-blue-500/20 scale-[1.02]`
                                    : "border-transparent hover:border-gray-300"
                                }`}
                                aria-pressed={isSelected}
                              >
                                {score}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculated Result Area */}
              <div className={`p-6 rounded-xl border-2 flex items-center justify-between ${selectedActionLevel.bg} ${selectedActionLevel.border}`}>
                <div>
                  <p className="text-sm font-bold text-gray-600">CALCULATED CSP1 SCORE</p>
                  <p className={`text-3xl font-black ${selectedActionLevel.color}`}>{finalScore} / 20</p>
                  <p className="text-xs font-bold text-gray-500">C{conditionScore} x P{priorityScore}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500">ACTION STATUS</p>
                  <p className={`font-bold ${selectedActionLevel.color}`}>{selectedActionLevel.label}</p>
                </div>
              </div>

              {/* Technical Textareas */}
              <div className="space-y-4">
                <textarea
                  placeholder="Technical Assessment (Foundation, Walls, Roof...)"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl h-32"
                  required
                />
                <textarea
                  placeholder="Required Preservation Actions..."
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl h-32"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <Send />}
                Publish Certified Assessment
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: The "Defense Evidence" */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="text-blue-400" /> CSP1 Matrix Logic
            </h3>
            <div className="space-y-4 text-xs">
              <p className="text-gray-400 italic">Score = Condition × Priority</p>
              <div className="border-l-2 border-green-500 pl-3">
                <p className="font-bold">1 - 4: Green</p>
                <p className="text-gray-400">Planned maintenance; building is functional.</p>
              </div>
              <div className="border-l-2 border-yellow-500 pl-3">
                <p className="font-bold">5 - 12: Yellow</p>
                <p className="text-gray-400">Condition monitoring; defects noted.</p>
              </div>
              <div className="border-l-2 border-red-500 pl-3">
                <p className="font-bold">13 - 20: Red</p>
                <p className="text-gray-400">Immediate Action; structural safety risk.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}