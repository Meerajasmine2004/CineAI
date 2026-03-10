import { Link } from 'react-router-dom';
import { Film, Play, Star, Clock } from 'lucide-react';
import Footer from '../components/Footer';
import RecommendedMovies from '../components/RecommendedMovies';

const HomePage = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser && storedUser !== "undefined" && storedUser !== "null" ? JSON.parse(storedUser) : null;
  const userId = user?._id;
  const isLoggedIn = !!userId; // Explicit boolean check
  const featuredMovies = [
    {
      id: 1,
      title: 'The Quantum Paradox',
      description: 'A mind-bending journey through time and space.',
      rating: 8.5,
      duration: '148 min',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    },
    {
      id: 2,
      title: 'Echoes of Tomorrow',
      description: 'In a world where memories can be bought and sold...',
      rating: 7.8,
      duration: '132 min',
      posterUrl: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop',
    },
    {
      id: 3,
      title: 'Shadow Warriors',
      description: 'An elite team faces their greatest challenge yet.',
      rating: 8.2,
      duration: '156 min',
      posterUrl: 'https://images.unsplash.com/photo-1571847140471-1d7766e825ea?w=400&h=600&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-6">
              Experience Movies
              <span className="gradient-text"> Like Never Before</span>
            </h1>
            <p className="text-xl text-dark-300 mb-8">
              AI-powered recommendations. Seamless booking. Real-time seat selection.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/movies" className="btn-primary">
                <Film className="w-5 h-5" />
                Browse Movies
              </Link>
              <Link to="/signup" className="btn-outline">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-display font-bold text-white">
              Now Showing
            </h2>
            <Link to="/movies" className="text-cinema-500 hover:text-cinema-400 font-medium">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredMovies.map((movie) => (
              <div key={movie.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <button className="btn-primary w-full">
                        <Play className="w-4 h-4" />
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{movie.title}</h3>
                <p className="text-dark-300 mb-3 line-clamp-2">{movie.description}</p>
                <div className="flex items-center gap-4 text-sm text-dark-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{movie.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{movie.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommended Movies */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RecommendedMovies userId={userId} />
      </div>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Why Choose CineAI?
            </h2>
            <p className="text-xl text-dark-300">
              The future of movie booking is here
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cinema-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Recommendations</h3>
              <p className="text-dark-300">
                Get personalized movie suggestions based on your preferences
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cinema-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Easy Booking</h3>
              <p className="text-dark-300">
                Seamless ticket booking with real-time seat selection
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cinema-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Exclusive Offers</h3>
              <p className="text-dark-300">
                Special discounts and member-only benefits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
