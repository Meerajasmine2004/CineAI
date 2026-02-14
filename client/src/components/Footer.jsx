import { Link } from 'react-router-dom';
import { Film, Instagram, Twitter, Youtube, Home, FilmIcon, User, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-900 text-dark-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Section - Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Film className="w-8 h-8 text-cinema-600" />
                <span className="text-xl font-display font-bold text-white">
                  CineAI
                </span>
              </div>
              <p className="text-sm text-dark-400 max-w-xs">
                AI-Powered Movie Booking Experience
              </p>
            </div>

            {/* Middle Section - Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/" 
                    className="flex items-center space-x-2 text-dark-300 hover:text-cinema-600 transition-colors duration-200"
                  >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/movies" 
                    className="flex items-center space-x-2 text-dark-300 hover:text-cinema-600 transition-colors duration-200"
                  >
                    <FilmIcon className="w-4 h-4" />
                    <span>Movies</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/coming-soon" 
                    className="flex items-center space-x-2 text-dark-300 hover:text-cinema-600 transition-colors duration-200"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Coming Soon</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 text-dark-300 hover:text-cinema-600 transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right Section - Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/cineai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center text-dark-300 hover:bg-cinema-600 hover:text-white transition-all duration-300 hover:scale-110 group"
                >
                  <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a
                  href="https://twitter.com/cineai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center text-dark-300 hover:bg-cinema-600 hover:text-white transition-all duration-300 hover:scale-110 group"
                >
                  <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
                <a
                  href="https://youtube.com/cineai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-dark-800 rounded-full flex items-center justify-center text-dark-300 hover:bg-cinema-600 hover:text-white transition-all duration-300 hover:scale-110 group"
                >
                  <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Horizontal Divider */}
          <div className="border-t border-dark-800 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <p className="text-sm text-dark-400">
                © 2026 CineAI. All rights reserved.
              </p>
              <div className="flex items-center space-x-6">
                <Link 
                  to="/terms" 
                  className="text-sm text-dark-400 hover:text-cinema-600 transition-colors duration-200"
                >
                  Terms of Service
                </Link>
                <Link 
                  to="/privacy" 
                  className="text-sm text-dark-400 hover:text-cinema-600 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/contact" 
                  className="text-sm text-dark-400 hover:text-cinema-600 transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
