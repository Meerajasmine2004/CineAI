import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Globe, Star, ArrowLeft, Film, Ticket } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiTheatre, setAiTheatre] = useState(null);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    const fetchAiTheatre = async () => {
      try {
        const response = await api.get(`/recommendations/theatre/${id}`);
        
        if (response.data.success) {
          setAiTheatre(response.data.data?.theatre);
        }
      } catch (err) {
        console.error('Error fetching AI theatre:', err);
      }
    };

    fetchAiTheatre();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/movies/${id}`);
      
      if (response.data.success) {
        setMovie(response.data.data);
      } else {
        setError('Movie not found');
      }
    } catch (err) {
      setError('Failed to fetch movie details');
      console.error('Fetch movie details error:', err);
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
      month: 'long', 
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
          <p className="text-white text-lg">Loading movie details...</p>
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
          <Link 
            to="/movies"
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 px-4 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
          <p className="text-dark-300 mb-6">The movie you're looking for doesn't exist.</p>
          <Link 
            to="/movies"
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 px-4 pb-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/movies"
            className="text-cinema-500 hover:text-cinema-400 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Movies
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Movie Poster */}
          <div className="lg:w-1/3">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
              <img 
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              
              {/* Coming Soon Badge */}
              {movie.isComingSoon && (
                <div className="absolute top-4 right-4 bg-cinema-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Coming Soon
                </div>
              )}
            </div>
          </div>

          {/* Movie Information */}
          <div className="lg:w-2/3">
            <div className="glass rounded-xl p-6 border border-dark-800">
              {/* Title and Badge */}
              <div className="flex items-start justify-between mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {movie.title}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-lg text-dark-300">4.5</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-3">Synopsis</h2>
                <p className="text-dark-300 leading-relaxed">
                  {movie.description}
                </p>
              </div>

              {/* Movie Details */}
              <div className="space-y-4">
                {/* Genres */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {(movie.genre || []).map((g, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-dark-800 text-dark-300 rounded-full text-sm font-medium"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Languages</h3>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cinema-500" />
                    <span className="text-dark-300">{movie.language?.join(', ') || "English"}</span>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Duration</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cinema-500" />
                    <span className="text-dark-300">{formatDuration(movie.duration)}</span>
                  </div>
                </div>

                {/* Release Date */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Release Date</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cinema-500" />
                    <span className="text-dark-300">{formatDate(movie.releaseDate)}</span>
                  </div>
                </div>

                {/* Recommended Theatre */}
                {aiTheatre && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Recommended Theatre</h3>
                    <div className="flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-2">
                      <span className="text-white">{aiTheatre}</span>
                      <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                        AI Pick
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-8">
                {movie.isComingSoon ? (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-3 bg-dark-800 rounded-lg">
                      <Calendar className="w-5 h-5 text-cinema-500" />
                      <span className="text-white font-medium">Coming {formatDate(movie.releaseDate)}</span>
                    </div>
                  </div>
                ) : (
                  <Link 
                    to={`/book/${movie._id}`}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-5 h-5" />
                    Book Tickets
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
