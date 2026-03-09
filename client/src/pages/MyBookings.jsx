import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Film, Ticket, ArrowRight, Trash2, MapPin } from 'lucide-react';
import api from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/bookings/my');

      if (response.data.success) {
        setBookings(response.data.data);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/bookings/${id}`);

      // Remove from UI instantly
      setBookings(prevBookings =>
        prevBookings.filter(booking => booking._id !== id)
      );

    } catch (error) {
      console.error("Cancel booking error:", error);
    }
  };

  const formatShowTime = (showTime) => {
    return showTime;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleImageError = (e) => {
    e.target.src =
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&h=750&fit=crop&auto=format&dpr=2';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cinema-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center text-white">
        {error}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 flex items-center justify-center text-center">
        <div>
          <Ticket className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">No Bookings Yet</h2>
          <Link to="/movies" className="btn-primary">
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-white">My Bookings</h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="glass rounded-xl overflow-hidden border border-dark-800 hover:border-cinema-600 transition-all duration-300"
          >
            {/* Poster */}
            <div className="relative aspect-[2/3] overflow-hidden">
              <img
                src={booking.movie?.poster}
                alt={booking.movie?.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />

              {/* Status Badge */}
              <div
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${
                  booking.bookingStatus === 'confirmed'
                    ? 'bg-green-600'
                    : 'bg-red-600'
                } text-white`}
              >
                {booking.bookingStatus === 'confirmed'
                  ? 'Confirmed'
                  : 'Cancelled'}
              </div>
            </div>

            {/* Details */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                {booking.movie?.title}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-dark-300">
                  <Calendar className="w-4 h-4 text-cinema-500" />
                  {formatDate(booking.bookingDate)}
                </div>

                <div className="flex items-center gap-2 text-dark-300">
                  <Clock className="w-4 h-4 text-cinema-500" />
                  {formatShowTime(booking.showTime)}
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>Theatre: {booking.theatre}</span>
                </div>

                <div className="flex items-center gap-2 text-dark-300">
                  <Users className="w-4 h-4 text-cinema-500" />
                  Seats: {booking.seats.join(', ')}
                </div>

                <div className="text-white font-semibold">
                  ₹{booking.totalPrice}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleCancelBooking(booking._id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancel Booking
                </button>

                <Link
                  to={`/movies/${booking.movie?._id}`}
                  className="flex-1 bg-dark-800 hover:bg-dark-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <ArrowRight className="w-4 h-4" />
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
