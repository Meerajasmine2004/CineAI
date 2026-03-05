import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Globe, Film, Star } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/movies');
      
      if (response.data.success) {
        setMovies(response.data.data);
      } else {
        setError('Failed to fetch movies');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch movies error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&h=750&fit=crop&auto=format&dpr=2';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 px-4 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-cinema-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 px-4 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-dark-300 mb-6">{error}</p>
          <button 
            onClick={fetchMovies}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 px-4 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Movies Available</h2>
          <p className="text-dark-300 mb-6">Check back later for new releases!</p>
          <button 
            onClick={fetchMovies}
            className="btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 px-4 pb-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Movies</h1>
        <p className="text-dark-300 text-lg">Discover the latest movies and book your tickets</p>
      </div>

      {/* Movies Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <div key={movie._id} className="glass rounded-xl overflow-hidden border border-dark-800 hover:border-cinema-600 transition-all duration-300 group">
              {/* Movie Poster */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={handleImageError}
                />
                
                {/* Coming Soon Badge */}
                {movie.isComingSoon && (
                  <div className="absolute top-4 right-4 bg-cinema-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Coming Soon
                  </div>
                )}
              </div>

              {/* Movie Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-cinema-500 transition-colors duration-200">
                    {movie.title}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-dark-300">4.5</span>
                  </div>
                </div>

                <p className="text-dark-300 text-sm mb-4 line-clamp-3">
                  {movie.description}
                </p>

                {/* Movie Metadata */}
                <div className="space-y-3">
                  {/* Genres */}
                  <div className="flex flex-wrap gap-2">
                    {movie.genre?.map((g, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-dark-800 text-dark-300 rounded-full text-xs font-medium"
                      >
                        {g}
                      </span>
                    )) || <span className="px-3 py-1 bg-dark-800 text-dark-300 rounded-full text-xs font-medium">Unknown Genre</span>}
                  </div>

                  {/* Duration, Language, Release Date */}
                  <div className="flex items-center justify-between text-sm text-dark-400">
                    <div className="flex items-center gap-4">
                      {/* Duration */}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(movie.duration)}</span>
                      </div>
                      
                      {/* Languages */}
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <span>{movie.language?.join(', ') || 'Unknown Language'}</span>
                      </div>
                    </div>
                    
                    {/* Release Date */}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(movie.releaseDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link 
                  to={`/movies/${movie._id}`}
                  className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
                >
                  <Film className="w-4 h-4" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Movies;
