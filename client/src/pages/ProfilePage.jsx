import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Edit, 
  LogOut, 
  Film,
  Clock,
  Globe,
  Save,
  Ticket,
  Award,
  ChevronRight,
  LogIn,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState(['english']);
  const [showTime, setShowTime] = useState('evening');
  const [saving, setSaving] = useState(false);

  // Initialize form with user data when component mounts
  useEffect(() => {
    if (user) {
      setSelectedGenres(user?.preferences?.genres || []);
      setSelectedLanguages(user?.preferences?.languages || ['english']);
      setShowTime(user?.preferences?.showTime || 'evening');
    }
  }, [user]);

  const genres = [
    { id: 'action', label: 'Action' },
    { id: 'romance', label: 'Romance' },
    { id: 'thriller', label: 'Thriller' },
    { id: 'scifi', label: 'Sci-Fi' },
    { id: 'comedy', label: 'Comedy' },
    { id: 'horror', label: 'Horror' },
    { id: 'drama', label: 'Drama' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'animation', label: 'Animation' },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'crime', label: 'Crime' },
    { id: 'documentary', label: 'Documentary' }
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'malayalam', label: 'Malayalam' },
    { value: 'kannada', label: 'Kannada' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'korean', label: 'Korean' },
    { value: 'japanese', label: 'Japanese' }
  ];

  const showTimes = [
    { value: 'morning', label: 'Morning (9AM - 12PM)' },
    { value: 'evening', label: 'Evening (6PM - 9PM)' },
    { value: 'night', label: 'Night (9PM - 12AM)' }
  ];

  const toggleGenre = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const toggleLanguage = (langValue) => {
    setSelectedLanguages(prev => 
      prev.includes(langValue) 
        ? prev.filter(lang => lang !== langValue)
        : [...prev, langValue]
    );
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
    setEditForm({
      name: user?.name || '',
      email: user?.email || ''
    });
    setSelectedGenres(user?.preferences?.genres || []);
    setSelectedLanguages(user?.preferences?.languages || ['english']);
    setShowTime(user?.preferences?.showTime || 'evening');
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        preferences: {
          genres: selectedGenres,
          languages: selectedLanguages,
          showTime: showTime
        }
      };

      const response = await api.put('/users/profile', updateData);
      
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        updateUser(response.data.data.user);
        setIsEditMode(false);
      } else {
        toast.error(response.data.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset to original values
    setSelectedGenres(user?.preferences?.genres || []);
    setSelectedLanguages(user?.preferences?.languages || ['english']);
    setShowTime(user?.preferences?.showTime || 'evening');
  };

  // If user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 px-4 pb-12 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="glass rounded-2xl p-8 border border-dark-800 text-center">
            {/* Lock Icon */}
            <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-dark-400" />
            </div>
            
            {/* Message */}
            <h2 className="text-2xl font-bold text-white mb-3">
              Please login to view your profile
            </h2>
            <p className="text-dark-300 mb-8">
              Access your profile, manage preferences, and view booking history.
            </p>
            
            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login to Your Account
            </button>
            
            {/* Signup Link */}
            <p className="mt-6 text-sm text-dark-300">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-cinema-600 hover:text-cinema-500 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated
  return (
    <div className="min-h-screen bg-dark-950 pt-24 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header Section */}
        <div className="glass rounded-2xl p-8 mb-8 border border-dark-800">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cinema-600 to-cinema-700 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cinema-600/25">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </div>
              <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-cinema-600 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditMode ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cinema-500 focus:ring-1 focus:ring-cinema-500 transition-all duration-200 mb-3"
                    placeholder="Your name"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cinema-500 focus:ring-1 focus:ring-cinema-500 transition-all duration-200"
                    placeholder="Your email"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {user?.name || 'User'}
                  </h1>
                  <p className="text-dark-300">
                    {user?.email || 'user@example.com'}
                  </p>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditMode ? (
                <>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="btn-outline flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleEditProfile}
                    className="btn-outline flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="btn-outline flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10 hover:border-red-400/50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* AI Preferences Section */}
        <div className="glass rounded-2xl p-8 mb-8 border border-dark-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cinema-600/20 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-cinema-600" />
            </div>
            <h2 className="text-xl font-bold text-white">AI Preferences</h2>
          </div>

          {/* Genre Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">Favorite Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedGenres.includes(genre.id)
                      ? 'bg-cinema-600 text-white border-cinema-600'
                      : 'bg-dark-800 text-dark-300 border-dark-600 hover:border-dark-500 hover:text-white'
                  } border`}
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Preference */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Language Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => toggleLanguage(lang.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedLanguages.includes(lang.value)
                      ? 'bg-cinema-600 text-white border-cinema-600'
                      : 'bg-dark-800 text-dark-300 border-dark-600 hover:border-dark-500 hover:text-white'
                  } border`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Show Time */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Preferred Show Time
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              {showTimes.map((time) => (
                <label
                  key={time.value}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    showTime === time.value
                      ? 'bg-cinema-600/20 border-cinema-600 text-white'
                      : 'bg-dark-800 border-dark-600 text-dark-300 hover:border-dark-500 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="showTime"
                    value={time.value}
                    checked={showTime === time.value}
                    onChange={(e) => setShowTime(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{time.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Booking History Section - Empty State */}
        <div className="glass rounded-2xl p-8 mb-8 border border-dark-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center">
              <Ticket className="w-5 h-5 text-dark-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Booking History</h2>
          </div>

          <div className="text-center py-12">
            <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-dark-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No bookings yet</h3>
            <p className="text-dark-300 mb-6 max-w-md mx-auto">
              Book your first movie to unlock AI-powered recommendations.
            </p>
            <Link to="/movies" className="btn-primary inline-flex items-center gap-2">
              Browse Movies
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Rewards Section - Empty State */}
        <div className="glass rounded-2xl p-8 border border-dark-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-dark-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Rewards</h2>
          </div>

          <div className="text-center py-8">
            <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-dark-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Start earning rewards</h3>
            <p className="text-dark-300 max-w-md mx-auto">
              Start booking to earn rewards points and unlock exclusive benefits.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
