import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Helper function to get movie poster images
const getMovieImage = (title) => {
  if (!title) return "https://via.placeholder.com/300x450?text=No+Image";

  // Debug log
  console.log("Movie title:", title);

  const normalized = title?.toLowerCase()?.trim();

  const images = {
    "john wick": "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
    "inception": "https://m.media-amazon.com/images/I/91Rc8cAmnAL._AC_SY679_.jpg",
    "deadpool & wolverine": "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    "the dark knight": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "avatar": "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    "gladiator": "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg"
  };

  return images[normalized] || "https://via.placeholder.com/300x450?text=No+Image";
};

const RecommendedMovies = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get user from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser && storedUser !== "undefined" && storedUser !== "null" ? JSON.parse(storedUser) : null;
  const userId = user?._id;

  // Make fetchRecommendations reusable
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/recommendations/${userId}`);
      
      if (response.data.success) {
        setRecommendations(response.data.data);
      } else {
        setError('Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch recommendations if userId exists
    if (userId) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, []); // Remove userId dependency since we get it from localStorage

  // Listen for booking completion events
  useEffect(() => {
    const handleBookingCompleted = () => {
      if (userId) {
        fetchRecommendations();
      }
    };

    window.addEventListener("bookingCompleted", handleBookingCompleted);

    return () => {
      window.removeEventListener("bookingCompleted", handleBookingCompleted);
    };
  }, [userId]); // Include userId dependency for the event listener

  return (
    <div className="py-12 bg-[#020617]">
      <h2 className="text-3xl font-bold text-white mb-8">Recommended For You</h2>
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-[#0f172a] p-3 rounded-xl shadow-lg animate-pulse">
              {/* Movie Poster Skeleton */}
              <div className="bg-gray-700 rounded-lg h-64"></div>
              
              {/* Title Skeleton */}
              <div className="h-4 bg-gray-700 rounded mt-2"></div>
              
              {/* Genre Skeleton */}
              <div className="flex gap-2 mt-1">
                <div className="h-3 bg-gray-700 rounded w-12"></div>
                <div className="h-3 bg-gray-700 rounded w-12"></div>
              </div>
              
              {/* Button Skeleton */}
              <div className="h-8 bg-gray-700 rounded mt-2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-gray-400">{error}</p>
        </div>
      ) : !userId ? (
        <div className="text-center py-12">
          <p className="text-gray-300">
            Login to get personalized recommendations
          </p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No recommendations available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {recommendations.map((movie) => (
            <div key={movie._id} className="bg-[#0f172a] p-3 rounded-xl shadow-lg hover:scale-105 transition duration-300">
              {/* Movie Poster with AI Badge - Fixed Positioning */}
              <div className="relative">
                <img
                  src={getMovieImage(movie.title)}
                  alt={movie.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
                  }}
                />

                <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 text-xs rounded-full">
                  AI Pick
                </div>
              </div>
              
              {/* Movie Info */}
              <div>
                {/* Title */}
                <h3 className="text-white mt-2 font-semibold">
                  {movie.title}
                </h3>
                
                {/* Genre Tags */}
                <div className="flex gap-2 mt-1 flex-wrap">
                  {movie.genre?.slice(0,2).map((g, i) => (
                    <span key={i} className="bg-gray-200 text-black px-2 py-1 text-xs rounded">
                      {g}
                    </span>
                  ))}
                </div>
                
                {/* Book Button */}
                <button 
                  onClick={() => navigate(`/movie/${movie._id}`)}
                  className="bg-red-500 hover:bg-red-600 w-full mt-2 py-2 rounded text-white font-medium"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedMovies;
