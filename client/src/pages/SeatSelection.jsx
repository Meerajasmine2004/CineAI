import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, DollarSign, Film, ArrowLeft, Ticket, Check } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedShowTime, setSelectedShowTime] = useState('');
  const [selectedTheatre, setSelectedTheatre] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [bookedSeats, setBookedSeats] = useState([]);
  const [showTimes] = useState([
    '10:00 AM',
    '1:00 PM', 
    '4:00 PM',
    '7:00 PM',
    '10:00 PM'
  ]);
  const [theatres] = useState([
    'PVR Phoenix',
    'INOX Marina Mall',
    'AGS Villivakkam',
    'Luxe Cinemas',
    'SPI Palazzo'
  ]);

  const seatPrice = 200; // ₹200 per seat
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 14;

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    if (movie && selectedTheatre && bookingDate && selectedShowTime) {
      fetchBookedSeats();
    }
  }, [movie, selectedTheatre, bookingDate, selectedShowTime]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/movies/${id}`);
      
      if (response.data.success) {
        setMovie(response.data.data);
      } else {
        setError('Failed to fetch movie details');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Fetch movie error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedSeats = async () => {
    try {
      const res = await api.get(
        `/bookings/occupied?movieId=${id}&theatre=${selectedTheatre}&date=${bookingDate}&showTime=${selectedShowTime}` 
      );
      setBookedSeats(res.data.data);
    } catch (error) {
      console.error("Fetch booked seats error", error);
    }
  };

  const toggleSeat = (row, seatNumber) => {
    const seatId = `${row}${seatNumber}`;
    
    // Prevent selection of booked seats
    if (bookedSeats.includes(seatId)) {
      return;
    }
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleShowTimeChange = (e) => {
    setSelectedShowTime(e.target.value);
  };

  const handleTheatreChange = (e) => {
    setSelectedTheatre(e.target.value);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setBookingDate(date);
    
    // Format and set selected day
    const day = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    setSelectedDay(day);
  };

  const calculateTotalPrice = () => {
    let totalPrice = 0;
    
    selectedSeats.forEach(seat => {
      const row = seat.charAt(0).toUpperCase();
      
      if (["A", "B", "C"].includes(row)) {
        totalPrice += 200; // Normal seats
      } else if (["D", "E", "F"].includes(row)) {
        totalPrice += 250; // Premium seats
      } else if (["G", "H", "I", "J"].includes(row)) {
        totalPrice += 350; // VIP seats
      }
    });
    
    return totalPrice;
  };

  const getSeatClass = (seat, row) => {
    if (bookedSeats.includes(seat))
      return "bg-red-500 text-white cursor-not-allowed opacity-70";

    if (selectedSeats.includes(seat))
      return "bg-green-500 text-white";

    if (["A","B","C"].includes(row))
      return "bg-transparent border-2 border-gray-400 text-gray-300";

    if (["D","E","F"].includes(row))
      return "bg-transparent border-2 border-blue-500 text-blue-400";

    if (["G","H","I","J"].includes(row))
      return "bg-transparent border-2 border-yellow-400 text-yellow-300";
  };

  const confirmBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    if (!selectedShowTime) {
      toast.error('Please select a show time');
      return;
    }

    if (!selectedTheatre) {
      toast.error('Please select a theatre');
      return;
    }

    if (!bookingDate) {
      toast.error('Please select a booking date');
      return;
    }

    try {
      setBookingLoading(true);
      
      const bookingData = {
        movie,
        theatre: selectedTheatre,
        bookingDate,
        showTime: selectedShowTime.toLowerCase().replace(' ', '_'),
        seats: selectedSeats,
        totalPrice: calculateTotalPrice()
      };

      const response = await api.post('/bookings', bookingData);
      
      if (response.data.success) {
        toast.success('Booking confirmed successfully!');
        navigate('/bookings');
      } else {
        toast.error('Failed to create booking');
      }
    } catch (err) {
      toast.error('Booking failed. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setBookingLoading(false);
    }
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
          <button 
            onClick={() => navigate('/movies')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </button>
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
          <button 
            onClick={() => navigate('/movies')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 px-4 pb-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(`/movies/${id}`)}
            className="text-cinema-500 hover:text-cinema-400 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Movie
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Movie Info */}
          <div className="lg:w-1/3">
            <div className="glass rounded-xl p-6 border border-dark-800">
              <div className="flex gap-4 mb-4">
                <img 
                  src={movie.poster}
                  alt={movie.title}
                  className="w-24 h-36 object-cover rounded-lg"
                  onError={handleImageError}
                />
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{movie.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-dark-400">
                    <Calendar className="w-4 h-4" />
                    <span>{movie.genre.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Select Booking Date</label>
                <input 
                  type="date"
                  value={bookingDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-white"
                />
                {selectedDay && (
                  <div className="mt-2 text-sm text-cinema-400">
                    Selected: {selectedDay}
                  </div>
                )}
              </div>

              {/* Theatre Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Select Theatre</label>
                <select 
                  value={selectedTheatre}
                  onChange={handleTheatreChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-500"
                >
                  <option value="">Choose a theatre...</option>
                  {theatres.map((theatre) => (
                    <option key={theatre} value={theatre}>{theatre}</option>
                  ))}
                </select>
              </div>

              {/* Show Time Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Select Show Time</label>
                <select 
                  value={selectedShowTime}
                  onChange={handleShowTimeChange}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-500"
                >
                  <option value="">Choose a time...</option>
                  {showTimes.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* Booking Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Booking Date:</span>
                  <span className="text-white font-medium">
                    {bookingDate || 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Theatre:</span>
                  <span className="text-white font-medium">
                    {selectedTheatre || 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Show Time:</span>
                  <span className="text-white font-medium">
                    {selectedShowTime || 'Not selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Selected Seats:</span>
                  <span className="text-white font-medium">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-white">Total Price:</span>
                  <span className="text-cinema-500">₹{calculateTotalPrice()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Selection */}
          <div className="lg:w-2/3">
            <div className="glass rounded-xl p-6 border border-dark-800">
              <h2 className="text-xl font-bold text-white mb-6">Select Your Seats</h2>
              
              {/* Pricing Legend */}
              <div className="mb-6 p-4 bg-dark-900 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-3">Pricing Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                    <div>
                      <p className="text-xs text-dark-400">Normal (A-C)</p>
                      <p className="text-sm text-white font-medium">₹200</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                    <div>
                      <p className="text-xs text-dark-400">Premium (D-F)</p>
                      <p className="text-sm text-white font-medium">₹250</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-yellow-400 rounded"></div>
                    <div>
                      <p className="text-xs text-dark-400">VIP (G-J)</p>
                      <p className="text-sm text-white font-medium">₹350</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Screen */}
              <div className="mb-8">
                <div className="bg-dark-700 h-2 rounded-full mb-2"></div>
                <p className="text-center text-dark-400 text-sm mb-6">SCREEN</p>
              </div>

              {/* Seat Grid */}
              <div className="flex flex-col items-center space-y-2">
                {rows.map((row) => (
                  <div key={row} className="flex items-center gap-2 justify-center">
                    <span className="text-dark-400 font-medium w-4">{row}</span>
                    {Array.from({ length: seatsPerRow }, (_, index) => {
                      const seatNumber = index + 1;
                      const seatId = `${row}${seatNumber}`;
                      const isSelected = selectedSeats.includes(seatId);
                      const isBooked = bookedSeats.includes(seatId);
                      const aisleGap = seatNumber === 8 ? 'ml-6' : '';
                      
                      return (
                        <button
                          key={seatId}
                          onClick={() => !isBooked && toggleSeat(row, seatNumber)}
                          disabled={isBooked}
                          className={`w-10 h-10 rounded-md flex items-center justify-center text-sm font-semibold transition ${getSeatClass(seatId, row)} ${aisleGap}`}
                        >
                          {seatNumber}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-transparent border-2 border-gray-400 rounded-md"></div>
                  <span className="text-dark-300 text-sm">Normal (A-C)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-transparent border-2 border-blue-500 rounded-md"></div>
                  <span className="text-dark-300 text-sm">Premium (D-F)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-transparent border-2 border-yellow-400 rounded-md"></div>
                  <span className="text-dark-300 text-sm">VIP (G-J)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 border-2 border-green-500 rounded-md"></div>
                  <span className="text-dark-300 text-sm">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500 border-2 border-red-500 rounded-md opacity-70"></div>
                  <span className="text-dark-300 text-sm">Booked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Booking Button */}
        <div className="mt-8 text-center">
          <button
            onClick={confirmBooking}
            disabled={bookingLoading || selectedSeats.length === 0 || !selectedShowTime || !selectedTheatre}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bookingLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Confirm Booking
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
