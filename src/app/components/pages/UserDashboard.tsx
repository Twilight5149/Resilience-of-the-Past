import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, MessageSquare, Send, Loader2, MapPin, Calendar, ExternalLink, ArrowRight, Building2 } from "lucide-react";
import { fetchChurches, type Church } from "../../../services/churchAPI";

export default function UserDashboard() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<Array<{id: string, churchId: string, churchName: string, content: string, date: string}>>([]);
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    try {
      setLoading(true);
      const data = await fetchChurches();
      setChurches(data);
    } catch (error: any) {
      console.error('Failed to load churches:', error);
      const errorMessage = error?.message || 'Failed to load churches. Please check your Supabase connection.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChurch = (church: Church) => {
    setSelectedChurch(church);
    setShowPostForm(true);
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChurch || !postContent.trim()) return;

    const newPost = {
      id: Date.now().toString(),
      churchId: selectedChurch.id,
      churchName: selectedChurch.name,
      content: postContent,
      date: new Date().toISOString(),
    };

    setPosts([newPost, ...posts]);
    setPostContent("");
    setSelectedChurch(null);
    setShowPostForm(false);
  };

  const handleCancelPost = () => {
    setShowPostForm(false);
    setSelectedChurch(null);
    setPostContent("");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">User Dashboard</h1>
        <p className="text-gray-600">Share your church experiences and information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {showPostForm && selectedChurch ? (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Create New Post
              </h2>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-4">
                  {selectedChurch.images && selectedChurch.images.length > 0 ? (
                    <img
                      src={selectedChurch.images[0]}
                      alt={selectedChurch.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{selectedChurch.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedChurch.city}, {selectedChurch.country}</span>
                    </div>
                    <Link
                      to={`/church/${selectedChurch.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      View full details
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <button
                    onClick={handleCancelPost}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Change
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Post
                  </label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share your experience, historical information, or stories about this church..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Publish Post
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPost}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Select a Church to Share About</h2>

              {churches.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No churches available</h3>
                  <p className="text-gray-500">Churches will appear here once they are added by administrators</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {churches.map((church) => (
                    <div
                      key={church.id}
                      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      {church.images && church.images.length > 0 ? (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={church.images[0]}
                            alt={church.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{church.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{church.city}, {church.country}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <Calendar className="w-4 h-4" />
                          <span>Founded {church.founded}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSelectChurch(church)}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Create Post
                          </button>
                          <Link
                            to={`/church/${church.id}`}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1"
                          >
                            View
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Your Recent Posts</h2>

            {posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h3>
                <p className="text-gray-500">Create your first post to share information about churches!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="border-l-4 border-blue-600 pl-6 py-2">
                    <h3 className="font-semibold text-lg mb-1">{post.churchName}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-gray-700">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold text-blue-600">{posts.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Churches Documented</p>
                <p className="text-3xl font-bold text-blue-600">
                  {new Set(posts.map(p => p.churchId)).size}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Churches</p>
                <p className="text-3xl font-bold text-blue-600">{churches.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3">Posting Guidelines</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Share accurate historical information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Be respectful of all denominations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Include personal experiences when relevant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Verify facts before posting</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3">Explore More</h3>
            <p className="text-sm text-gray-700 mb-4">
              Discover churches from around the world and learn about their history and architecture
            </p>
            <Link
              to="/search"
              className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Browse All Churches
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
