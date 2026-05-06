import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { 
  MapPin, 
  Shield, 
  ExternalLink, 
  Loader2, 
  HelpCircle, 
  X, 
  Navigation, MessageSquare, Camera, CheckCircle, User as UserIcon
} from "lucide-react";
import { fetchChurchById, getLatestExpertRating, type Church } from "../../../services/churchAPI";

export default function ChurchDetail() {
  const { id } = useParams();
  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDistance, setUserDistance] = useState<number | null>(null);
  
  // Fullscreen Modal State
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);
  const closeModal = () => setActiveModalImage(null);

  useEffect(() => {
    if (id) loadChurch(id);
  }, [id]);

  // Lock scroll when image is fullscreen
  useEffect(() => {
    document.body.style.overflow = activeModalImage ? 'hidden' : 'unset';
  }, [activeModalImage]);

  // Calculate Distance when church is loaded
  useEffect(() => {
    if (church && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (church.lat && church.lng) {
          const dist = calculateDistance(
            position.coords.latitude,
            position.coords.longitude,
            church.lat,
            church.lng
          );
          setUserDistance(dist);
        }
      });
    }
  }, [church]);

  const loadChurch = async (churchId: string) => {
    try {
      setLoading(true);
      const data = await fetchChurchById(churchId);
      setChurch(data);
    } catch (error) {
      console.error("Failed to load church:", error);
      setChurch(null);
    } finally {
      setLoading(false);
    }
  };

  // Haversine Formula for Distance
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!church) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Church not found</h1>
        <Link to="/search" className="text-blue-600 hover:underline">Return to search</Link>
      </div>
    );
  }

  const images = church.images || ["/placeholder.jpg"];
  const mapQuery = encodeURIComponent(`${church.name}, ${church.city}, ${church.province}`);
  const simpleMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Dynamic Logic: Determine rating based on expert_ratings array from dashboard
  const latestReview = getLatestExpertRating(church);
  const latestRating = latestReview?.rating;
  const getUploaderName = (post: any) => {
    const candidates = [
      post.user_name,
      post.userName,
      post.profiles?.name,
      post.profile?.name,
      post.profiles?.email,
      post.profile?.email,
    ];

    return candidates.find((value) => value && value !== "Community Member") || "Community Member";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/search" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Search
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        {/* Hero Image */}
        <div 
          className="relative h-96 w-full cursor-zoom-in group" 
          onClick={() => setActiveModalImage(images[0])}
        >
          <img src={images[0]} alt={church.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
            Click to enlarge
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{church.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span>{church.address}, {church.city}</span>
                </div>
                {userDistance !== null && (
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                    <Navigation className="w-4 h-4 fill-current" />
                    <span>{userDistance.toFixed(1)} km away</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-semibold">
                Est. {church.founded}
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-md text-sm font-semibold">
                {church.architecturalStyle}
              </span>
            </div>
          </div>

          {/* Dynamic Rating Section */}
          <div className="mb-12">
              {typeof latestRating === "number" ? (
                /* RATED: Shows if a review exists in the expert_ratings array */
                <div className={`flex items-center gap-6 p-6 rounded-2xl border-2 ${
                  latestRating >= 13 ? 'bg-red-50 border-red-100 text-red-900' : 
                  latestRating >= 5 ? 'bg-yellow-50 border-yellow-100 text-yellow-900' : 'bg-green-50 border-green-100 text-green-900'
                }`}>
                  <div className="bg-white p-3 rounded-xl shadow-sm">
                    <Shield className="w-8 h-8 text-current" />
                  </div>
                  <div>
                    <p className="font-black text-3xl tracking-tighter">
                      CSP1 SCORE: {latestRating}/20
                    </p>
                    <p className="text-sm font-medium opacity-70 italic">Verified Engineering Audit</p>
                  </div>
                </div>
              ) : (
                /* UNRATED: Shows if the expert_ratings array is empty */
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-6 rounded-2xl text-slate-500">
                  <HelpCircle className="w-8 h-8" />
                  <div>
                    <p className="font-bold text-slate-700">Awaiting Engineering Review</p>
                    <p className="text-sm">This historic structure is currently listed as unrated.</p>
                  </div>
                </div>
              )}
            </div>

          {/* Text Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">{church.description}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Historical Significance</h2>
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">{church.history}</p>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-4">Quick Details</h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-gray-500 font-medium">Diocese</dt>
                    <dd className="text-gray-900 font-semibold">{church.diocese || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Feast Day</dt>
                    <dd className="text-gray-900 font-semibold">{church.feast || "N/A"}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  <Navigation className="w-5 h-5" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="text-red-500" /> Location Details
            </h2>
            <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 bg-gray-100">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={simpleMapUrl}
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {images.length > 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Visual Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div 
                key={index}
                className="relative aspect-square overflow-hidden rounded-xl cursor-zoom-in hover:ring-4 ring-blue-500/20 transition-all"
                onClick={() => setActiveModalImage(image)}
              >
                <img
                  src={image}
                  alt={`${church.name} view ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activeModalImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={closeModal}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:bg-white/10 p-3 rounded-full transition-colors"
            onClick={closeModal}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={activeModalImage} 
            alt="Fullscreen view" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      {/* --- EXPERT AUDIT SECTION --- */}
      {church.expert_ratings && church.expert_ratings.length > 0 && (
        <section className="mt-12 bg-blue-50 rounded-3xl p-8 border border-blue-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-black text-slate-800">Verified Structural Audit</h2>
              <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">Official Expert Review</p>
            </div>
          </div>

          <div className="space-y-8">
            {church.expert_ratings.map((rating: any) => (
              <div key={rating.id} className="grid md:grid-cols-4 gap-8 items-start">
                <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center border border-blue-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CSP1 Score</span>
                  <div className="text-5xl font-black text-blue-600">{rating.rating}<span className="text-xl text-blue-200">/20</span></div>
                  <div className="mt-2 flex items-center gap-1 text-green-600 font-bold text-xs">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </div>
                </div>
                
                <div className="md:col-span-3 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase mb-2">Detailed Assessment</h4>
                    <p className="text-slate-700 leading-relaxed italic">"{rating.assessment}"</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase mb-2">Recommendations</h4>
                    <div className="p-4 bg-white/50 rounded-xl border border-blue-50 text-slate-600 text-sm">
                      {rating.recommendations}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- COMMUNITY FEED SECTION --- */}
      <section className="mt-16 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Community Stories</h2>
          </div>
          
          <Link 
            to="/dashboard" 
            state={{ 
              preSelectChurchId: church.id, 
              preSelectChurchName: church.name 
            }}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700 flex items-center gap-2 transition-all shadow-lg shadow-purple-100"
          >
            <MessageSquare className="w-4 h-4" />
            Share Your Story
          </Link>
        </div>

        {!church.user_posts || church.user_posts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No community stories yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {church.user_posts.map((post: any) => (
              <Link
                key={post.id}
                to={`/church/${post.church_id || church.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-300"
              >
                {post.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt="Community visit" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-800">{getUploaderName(post)}</p>
                      <p className="text-[10px] text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-purple-600">
                    {post.church_name || church.name}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}