import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Search, LogOut, Menu, X, Ticket, LogIn, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { isAuthenticated, logout, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass shadow-2xl' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Film className="w-10 h-10 text-cinema-600 group-hover:text-cinema-500 transition-colors duration-300" />
                <div className="absolute inset-0 bg-cinema-600 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text hidden sm:block">
                CineAI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`font-medium hover:text-cinema-600 ${
                  isActive('/') ? 'text-cinema-600' : 'text-gray-300'
                }`}
              >
                Home
              </Link>
              <Link
                to="/movies"
                className={`font-medium hover:text-cinema-600 ${
                  isActive('/movies') ? 'text-cinema-600' : 'text-gray-300'
                }`}
              >
                Movies
              </Link>
              <Link
                to="/coming-soon"
                className={`font-medium hover:text-cinema-600 ${
                  isActive('/coming-soon') ? 'text-cinema-600' : 'text-gray-300'
                }`}
              >
                Coming Soon
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              
              {/* Search */}
              <div className="relative hidden lg:block">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search movies..."
                      className="w-64 bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="ml-2 p-2"
                    >
                      <X />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2"
                  >
                    <Search />
                  </button>
                )}
              </div>

              {/* Auth Buttons */}
              {loading ? (
                <div className="w-8 h-8 border-2 border-cinema-600 border-t-transparent rounded-full animate-spin"></div>
              ) : isAuthenticated ? (
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-cinema-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Profile Dropdown */}
                  <div className={`absolute right-0 mt-2 w-48 glass rounded-lg border border-dark-700 overflow-hidden transition-all duration-200 ${
                    isProfileDropdownOpen 
                      ? 'opacity-100 translate-y-0 visible' 
                      : 'opacity-0 -translate-y-2 invisible'
                  }`}>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors duration-200"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors duration-200"
                      >
                        <Ticket className="w-4 h-4" />
                        My Bookings
                      </Link>
                      <div className="border-t border-dark-700 my-2"></div>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors duration-200 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 border border-dark-600 hover:border-dark-500 text-white rounded-lg transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>

            </div> {/* End Right Section */}

          </div> {/* End Flex Container */}
        </div> {/* End max-w-7xl */}
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-dark-950/95 backdrop-blur-sm z-40">
          <div className="flex flex-col p-4 space-y-4">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/movies" onClick={() => setIsMobileMenuOpen(false)}>Movies</Link>
            <Link to="/coming-soon" onClick={() => setIsMobileMenuOpen(false)}>Coming Soon</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                <Link to="/bookings" onClick={() => setIsMobileMenuOpen(false)}>My Bookings</Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-dark-300 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
