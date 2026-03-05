import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BecauseYouWatched = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser && storedUser !== "undefined" && storedUser !== "null" ? JSON.parse(storedUser) : null;
  const userId = user?._id;

  const fetchBecauseYouWatched = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/recommendations/because-you-watched/${userId}`);
      
      if (response.data.success) {
        setMovies(response.data.data);
      } else {
        setError('Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error fetching "Because You Watched" recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if userId exists
    if (userId) {
      fetchBecauseYouWatched();
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for booking completion events to refresh
  useEffect(() => {
    const handleBookingCompleted = () => {
      if (userId) {
        fetchBecauseYouWatched();
      }
    };

    window.addEventListener("bookingCompleted", handleBookingCompleted);

    return () => {
      window.removeEventListener("bookingCompleted", handleBookingCompleted);
    };
  }, [userId]);

  // Don't render if user is not logged in
  if (!userId) {
    return null;
  }

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-white mb-8">Because You Watched</h2>
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 rounded-lg h-64 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No watched movies yet. Start booking to see personalized recommendations!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
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

export default BecauseYouWatched;
