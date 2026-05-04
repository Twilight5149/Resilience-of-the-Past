import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, MapPin, Filter, Navigation, Shield, Loader2, Building2 } from "lucide-react";
import { fetchChurches, type Church } from "../../../services/churchAPI";
import { getPublicImageUrls } from "../../../utils/supabase"; // import helper

export default function ChurchSearch() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChurches, setFilteredChurches] = useState<Church[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'rating'>('name');

  // Load churches from database on mount
  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    try {
      setLoading(true);
      const data = await fetchChurches();

      // STEP: Convert image paths to public URLs
      const mappedData = data.map((church) => ({
        ...church,
        images: Array.isArray(church.images) ? church.images : [],
      }));
      setChurches(mappedData);
      setFilteredChurches(mappedData);

      setChurches(mappedData);
      setFilteredChurches(mappedData);
    } catch (error: any) {
      console.error('Failed to load churches:', error);
      const errorMessage = error?.message || 'Failed to load churches. Please check your Supabase connection.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = churches;

    if (searchTerm) {
      filtered = filtered.filter((church) =>
        church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.architecturalStyle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => (b.structuralRating || 0) - (a.structuralRating || 0));
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'distance' && userLocation) {
      filtered = [...filtered].sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    setFilteredChurches(filtered);
  }, [searchTerm, sortBy, userLocation, churches]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setSortBy('distance');
        },
        () => alert("Unable to get your location. Please enable location services.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Search Churches</h1>
        <p className="text-gray-600">Discover and explore churches around the world</p>
      </div>

      {/* Search & Sort */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by name or location
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search churches..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'distance' | 'name' | 'rating')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Name</option>
              <option value="rating">Safety Rating</option>
              <option value="distance" disabled={!userLocation}>Distance (Enable Location)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGetLocation}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Navigation className="w-4 h-4" />
          {userLocation ? "Location Enabled" : "Enable Location for Nearby Search"}
        </button>

        {userLocation && (
          <p className="mt-2 text-sm text-green-600">
            Location enabled. Churches sorted by distance from your location.
          </p>
        )}
      </div>

      {/* Church Grid */}
      <div className="mb-6">
        <p className="text-gray-600">
          Found {filteredChurches.length} {filteredChurches.length === 1 ? 'church' : 'churches'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChurches.map((church) => {
          const distance = userLocation
            ? calculateDistance(userLocation.lat, userLocation.lng, church.lat, church.lng)
            : null;

          return (
            <Link
              key={church.id}
              to={`/church/${church.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              {church.images && church.images.length > 0 ? (
                <div className="h-48 overflow-hidden">
                  <img
                    src={church.images[0]} // mapped to public URL
                    alt={church.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{church.name}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{church.city}, {church.province}, {church.country}</span>
                </div>
                {distance && (
                  <p className="text-sm text-blue-600 mb-2">{distance.toFixed(1)} km away</p>
                )}
                <p className="text-gray-600 text-sm mb-2">
                  {church.architecturalStyle} • Founded {church.founded}
                </p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">{church.description}</p>
                {church.structuralRating && (
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${church.structuralRating >= 8 ? 'text-green-600' : church.structuralRating >= 6 ? 'text-yellow-600' : 'text-red-600'}`} />
                    <span className="text-sm font-medium">Safety Rating: {church.structuralRating}/10</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filteredChurches.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No churches found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}