import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const RecommendedMovies = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="py-12">
      <h2 className="text-3xl font-bold text-white mb-8">Recommended For You</h2>
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 rounded-lg h-64 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
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
            <div key={movie._id} className="group cursor-pointer transition-transform duration-300 hover:scale-105">
              {/* Movie Poster */}
              <div className="relative overflow-hidden rounded-lg mb-3">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x450/cccccc/666666?text=No+Poster';
                  }}
                />
                
                {/* Recommendation Score Badge */}
                {movie.recommendationScore && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow">
                    AI Pick
                  </div>
                )}
              </div>
              
              {/* Movie Info */}
              <div className="space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-white text-sm mt-2 line-clamp-1">
                  {movie.title}
                </h3>
                
                {/* Genre */}
                <div className="flex flex-wrap gap-1">
                 {(movie.genre || []).slice(0, 2).map((g, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded"
                    >
                      {g}
                    </span>
                  ))}
                  {(movie.genre || []).length > 2 && (
                    <span className="text-xs text-gray-400">
                      +{(movie.genre || []).length - 2}
                    </span>
                  )}
                </div>
                
                {/* Language */}
                <p className="text-xs text-gray-400 capitalize">
                  {movie.language}
                </p>
                
                {/* Book Now Button */}
                <Link
                  to={`/movies/${movie._id}`}
                  className="block mt-2 text-center bg-cinema-600 text-white py-1 rounded hover:bg-cinema-500 transition"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedMovies;
