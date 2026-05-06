import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Shield, MapPin, Users, BookOpen, Calculator, ExternalLink } from "lucide-react";
import { fetchChurches, getChurchRatingValue, Church } from "../../../services/churchAPI";

export default function Home() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchChurches()
      .then((data) => {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setChurches(shuffled);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (churches.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, [churches]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500 text-lg">Loading churches...</p>
      </div>
    );
  }

  const filmStrip = churches.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-20 overflow-hidden min-h-[500px] flex items-center">
        <div className="absolute inset-0 flex w-full h-full">
          {filmStrip.map((church, index) => (
            <div 
              key={church.id}
              className="relative flex-1 h-full transition-all duration-1000 ease-in-out border-r border-blue-900/20 last:border-r-0"
              style={{
                backgroundImage: `url(${church.images[0]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: activeIndex === index ? 'brightness(0.7)' : 'brightness(0.3)'
              }}
            >
              <div className="absolute inset-0 bg-blue-900/30" />
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Resilience of The Past
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 drop-shadow-md">
            Explore, document, and preserve the rich history of churches worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 inline-flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
              <Search className="w-5 h-5" />
              Search Churches
            </Link>
            <Link
              to="/signup"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 border-2 border-white inline-flex items-center justify-center gap-2 transition-transform hover:scale-105"
            >
              <Users className="w-5 h-5" />
              Join Community
            </Link>
          </div>
        </div>
      </section>

      {/* Why Resilience Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Resilience?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rich Documentation</h3>
              <p className="text-gray-600">
                Access comprehensive historical information, architectural details, and community stories.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Verification</h3>
              <p className="text-gray-600">
                Verified structural engineers provide safety ratings and professional assessments.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Location-Based Search</h3>
              <p className="text-gray-600">
                Find churches near you with integrated maps and distance calculations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Churches */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Churches</h2>
            <Link to="/search" className="text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {churches.slice(0, 3).map((church) => {
                  const ratingValue = getChurchRatingValue(church);
                  const hasRating = ratingValue !== null;

                  return (
                    <Link
                      key={church.id}
                      to={`/church/${church.id}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="h-48 overflow-hidden">
                        <img
                          src={church.images[0]}
                          alt={church.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{church.name}</h3>

                        <p className="text-gray-600 text-sm mb-2">
                          {church.city}, {church.province || church.country}
                        </p>

                        <p className="text-gray-600 text-sm mb-4">
                          Founded: {church.founded}
                        </p>

                        <div className="flex items-center gap-2">
                          <Shield
                            className={`w-4 h-4 ${
                              ratingValue === null
                                ? "text-gray-400"
                                : ratingValue >= 13
                                  ? "text-red-600"
                                  : ratingValue >= 5
                                    ? "text-yellow-600"
                                    : "text-green-600"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            CSP1 Score:{" "}
                            {hasRating
                              ? `${ratingValue}/20`
                              : "Unrated"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
        </div>
      </section>

      {/* Contribute & How It Works Sections */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Contribute to Preservation</h2>
          <p className="text-xl mb-8 text-blue-100">
            Share your knowledge, photos, and stories to help preserve church history.
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 inline-block"
          >
            Get Started
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1,2,3,4].map((step) => (
              <div key={step} className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step}
                </div>
                {step === 1 && (
                  <><h3 className="font-semibold mb-2">Create Account</h3><p className="text-gray-600 text-sm">Sign up as a user, expert, or admin</p></>
                )}
                {step === 2 && (
                  <><h3 className="font-semibold mb-2">Search & Explore</h3><p className="text-gray-600 text-sm">Find churches near you or browse globally</p></>
                )}
                {step === 3 && (
                  <><h3 className="font-semibold mb-2">Contribute</h3><p className="text-gray-600 text-sm">Share information, photos, and stories</p></>
                )}
                {step === 4 && (
                  <><h3 className="font-semibold mb-2">Verify</h3><p className="text-gray-600 text-sm">Experts provide structural assessments</p></>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-blue-300">Research Basis</p>
                  <h2 className="text-3xl font-bold">CSP1 Structural Rating</h2>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed text-lg mb-6">
                Our structural score follows the Condition Survey Protocol 1 matrix developed by Adi Ifran Che-Ani,
                Azimin Samsul Mohd Tazilan, and Kamarul Afizi Kosman of Universiti Kebangsaan Malaysia. The method
                multiplies a building element's condition rating by its repair priority, producing a 1-20 score that
                separates planned maintenance, monitoring needs, and urgent structural attention.
              </p>

              <p className="text-slate-300 leading-relaxed text-lg">
                We use CSP1 because heritage churches need a consistent first-line visual inspection method: it turns
                expert observations into comparable scores, highlights defects that need serious attention, and keeps
                the result understandable for administrators, communities, and preservation teams.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <span className="text-slate-400">Formula</span>
                  <span className="font-bold text-white">Condition x Priority</span>
                </div>
                <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <span className="text-slate-400">Scale</span>
                  <span className="font-bold text-white">1-20</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Source</span>
                  <span className="font-bold text-white text-right">Structural Survey, 2011</span>
                </div>
              </div>

              <a
                href="https://doi.org/10.1108/02630801111118395"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 font-bold text-sm"
              >
                Che-Ani, Tazilan, and Kosman
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}