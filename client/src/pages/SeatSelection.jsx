import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, DollarSign, Film, ArrowLeft, Ticket, Check } from 'lucide-react';
import { io } from 'socket.io-client';
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
  const [lockedSeats, setLockedSeats] = useState({});
  const [socket, setSocket] = useState(null);
  const [aiTheatre, setAiTheatre] = useState(null);
  const [recommendedSeats, setRecommendedSeats] = useState([]);
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
    'SPI Palazzo'
  ]);

  const seatPrice = 200; // ₹200 per seat
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 14;

  // Socket connection useEffect
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("seatLocked", ({ seat, lockedBy }) => {
      setLockedSeats(prev => ({
        ...prev,
        [seat]: lockedBy
      }));
      console.log(`Seat ${seat} locked by ${lockedBy}`);
    });

    newSocket.on("seatUnlocked", ({ seat }) => {
      setLockedSeats(prev => {
        const updated = { ...prev };
        delete updated[seat];
        return updated;
      });
      console.log(`Seat ${seat} unlocked`);
    });

    newSocket.on("seatAlreadyLocked", ({ movieId, showTime, seat }) => {
      if (movieId === id && showTime === selectedShowTime) {
        toast.error(`Seat ${seat} is already being selected by another user`);
      }
    });

    newSocket.on("seatBooked", ({ seats, movieId, theatre, showTime, bookingDate }) => {
      const bookedDateOnly = bookingDate.split("T")[0];

      if (
        movieId === id &&
        theatre === selectedTheatre &&
        showTime === selectedShowTime &&
        bookedDateOnly === bookingDate
      ) {
        setBookedSeats(prev => [...new Set([...prev, ...seats])]);
      }
    });

    newSocket.on("seatCancelled", ({ seats, movieId, theatre, showTime, bookingDate }) => {
      const cancelledDateOnly = bookingDate.split("T")[0];

      if (
        movieId === id &&
        theatre === selectedTheatre &&
        showTime === selectedShowTime &&
        cancelledDateOnly === bookingDate
      ) {
        setBookedSeats(prev =>
          prev.filter(seat => !seats.includes(seat))
        );
      }
    });

    return () => {
      newSocket.off("seatLocked");
      newSocket.off("seatUnlocked");
      newSocket.off("seatAlreadyLocked");
      newSocket.off("seatBooked");
      newSocket.off("seatCancelled");
      
      Object.keys(lockedSeats).forEach((seat) => {
        if (lockedSeats[seat] === newSocket.id) {
          newSocket.emit("unlockSeat", {
            movieId: id,
            showTime: selectedShowTime,
            seat: seat
          });
        }
      });
      newSocket.disconnect();
    };
  }, [id, selectedShowTime]);

  // Movie details fetch
  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  // AI theatre fetch
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

  // Booked seats fetch
  useEffect(() => {
    if (id && selectedShowTime && bookingDate) {
      fetchBookedSeats();
    }
  }, [id, selectedShowTime, bookingDate]);

  // LocalStorage management
  useEffect(() => {
    if (selectedShowTime)
      localStorage.setItem("selectedShowTime", selectedShowTime);

    if (selectedTheatre)
      localStorage.setItem("selectedTheatre", selectedTheatre);

    if (bookingDate)
      localStorage.setItem("bookingDate", bookingDate);
  }, [selectedShowTime, selectedTheatre, bookingDate]);

  // Load saved values on mount
  useEffect(() => {
    const savedTime = localStorage.getItem("selectedShowTime");
    const savedTheatre = localStorage.getItem("selectedTheatre");
    const savedDate = localStorage.getItem("bookingDate");

    if (savedTime) setSelectedShowTime(savedTime);
    if (savedTheatre) setSelectedTheatre(savedTheatre);

    if (savedDate) {
      setBookingDate(savedDate);

      const formattedDay = new Date(savedDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      setSelectedDay(formattedDay);
    }
  }, []);

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

  const fetchRecommendedSeats = async () => {
    console.log("Suggest Best Seats clicked");

    if (!selectedTheatre || !selectedShowTime) {
      toast.error("Select theatre and show time first");
      return;
    }

    try {
      const response = await api.get("/recommendations/seats", {
        params: {
          movieId: id,
          theatre: selectedTheatre,
          showTime: selectedShowTime
        }
      });

      console.log("Seat API response:", response.data);

      if (response.data.success) {
        setRecommendedSeats(response.data.data);
      }

    } catch (error) {
      console.error("Seat recommendation API error:", error);
    }
  };

  const fetchBookedSeats = async () => {
    try {
      if (!id || !selectedShowTime || !bookingDate) return;

      const response = await api.get("/bookings/seats", {
        params: {
          movieId: id,
          theatre: selectedTheatre,
          showTime: selectedShowTime
        }
      });

      if (response.data.success) {
        const seats =
          response.data.bookedSeats ||
          response.data.data ||
          [];

        setBookedSeats(seats);
      }

    } catch (error) {
      console.error("Failed to fetch booked seats", error);
    }
  };

  const handleSeatClick = (seat) => {
    if (bookedSeats.includes(seat)) {
      toast.error("Seat already booked");
      return;
    }

    if (socket && lockedSeats[seat] && lockedSeats[seat] !== socket.id) {
      toast.error("Seat is currently locked by another user");
      return;
    }

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(prev => prev.filter(s => s !== seat));
      if (socket) {
        socket.emit("unlockSeat", { movieId: id, showTime: selectedShowTime, seat });
      }
    } else {
      setSelectedSeats(prev => [...prev, seat]);
      if (socket) {
        socket.emit("lockSeat", { movieId: id, showTime: selectedShowTime, seat });
      }
    }
  };

  const handleTheatreChange = (e) => {
    const theatre = e.target.value;
    setSelectedTheatre(theatre);
  };

  const handleShowTimeChange = (e) => {
    const showTime = e.target.value;
    setSelectedShowTime(showTime);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setBookingDate(date);

    const formattedDay = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    setSelectedDay(formattedDay);
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
    if (bookedSeats.includes(seat)) {
      return "bg-red-600 text-white cursor-not-allowed";
    }
    
    if (socket && lockedSeats[seat] && lockedSeats[seat] !== socket.id) {
      return "bg-yellow-500 text-black";
    }
    
    if (selectedSeats.includes(seat)) {
      return "bg-green-600 text-white";
    }
    
    if (["A","B","C"].includes(row))
      return "border border-gray-500 text-gray-300 bg-transparent hover:bg-gray-700";

    if (["D","E","F"].includes(row))
      return "border border-blue-500 text-blue-300 bg-transparent hover:bg-blue-700";

    return "border border-yellow-400 text-yellow-300 bg-transparent hover:bg-yellow-700";
  };

  const confirmBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    if (!selectedShowTime || !selectedTheatre || !bookingDate) {
      toast.error('Please select show time, theatre, and date');
      return;
    }

    try {
      setBookingLoading(true);
      
      const response = await api.post('/bookings', {
        movie: id,
        theatre: selectedTheatre,
        bookingDate: bookingDate,
        showTime: selectedShowTime,
        seats: selectedSeats
      });

      if (response.data.success) {
        toast.success('Booking confirmed!');
        setSelectedSeats([]);
        
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      } else {
        toast.error(response.data.error || 'Booking failed');
      }
    } catch (error) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-dark-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Movie Details
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="glass rounded-xl p-6 border border-dark-800">
              <h2 className="text-xl font-bold text-white mb-6">Booking Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cinema-400" />
                  <div>
                    <p className="text-sm text-dark-400">Selected Date</p>
                    <p className="text-white font-medium">
                      {selectedDay || 'Not selected'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cinema-400" />
                  <div>
                    <p className="text-sm text-dark-400">Show Time</p>
                    <p className="text-white font-medium">
                      {selectedShowTime || 'Not selected'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cinema-400" />
                  <div>
                    <p className="text-sm text-dark-400">Theatre</p>
                    <p className="text-white font-medium">
                      {selectedTheatre || 'Not selected'}
                      {aiTheatre === selectedTheatre && (
                        <span className="ml-2 text-yellow-300">✨</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-cinema-400" />
                    <div>
                      <p className="text-sm text-dark-400">Booking Date</p>
                      <p className="text-white font-medium">
                        {bookingDate || 'Not selected'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
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

                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-2">Select Theatre</label>
                  <select 
                    value={selectedTheatre}
                    onChange={handleTheatreChange}
                    className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cinema-500"
                  >
                    <option value="">Choose a theatre...</option>
                    {theatres.map((theatre) => (
                      <option key={theatre} value={theatre}>
                        {theatre}
                        {aiTheatre === theatre && (
                          <span className="ml-2 text-yellow-300">✨</span>
                        )}
                      </option>
                    ))}
                  </select>
                </div>

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

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-cinema-400" />
                      <div>
                        <p className="text-sm text-dark-400">Total Price</p>
                        <p className="text-white font-medium">₹{calculateTotalPrice()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-cinema-400" />
                    <div>
                      <p className="text-sm text-dark-400">Seats Selected</p>
                        <p className="text-white font-medium">
                          {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="glass rounded-xl p-6 border border-dark-800">
              <h2 className="text-xl font-bold text-white mb-6">Select Your Seats</h2>
              
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

              {/* AI Seat Recommendation Button */}
              <button
                onClick={fetchRecommendedSeats}
                className="bg-purple-600 text-white px-4 py-2 rounded mb-4 flex items-center gap-2 hover:bg-purple-700 transition"
              >
                ✨ Suggest Best Seats
              </button>
              
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
                      const number = index + 1;
                      const seatId = `${row}${number}`;
                      const isRecommended = recommendedSeats.includes(seatId);
                      const aisleGap = number === 8 ? 'ml-6' : '';
                      
                      return (
                        <button
                          key={seatId}
                          onClick={() => handleSeatClick(seatId)}
                          disabled={bookedSeats.includes(seatId)}
                          className={`seat w-10 h-10 rounded-md flex items-center justify-center text-sm font-semibold transition relative ${getSeatClass(seatId, row)} ${isRecommended ? "bg-purple-500 border-purple-300 text-white" : ""} ${bookedSeats.includes(seatId) ? 'cursor-not-allowed opacity-70' : ''} ${aisleGap}`}
                        >
                          {number}
                          {recommendedSeats.includes(seatId) && (
                            <span className="absolute top-0 right-0 text-yellow-300 text-xs">✨</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-600 text-white border-green-600 rounded-md"></div>
                  <span className="text-dark-300 text-sm">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 text-white border-red-600 rounded-md"></div>
                  <span className="text-dark-300 text-sm">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-500 text-black border-yellow-600 rounded-md"></div>
                  <span className="text-dark-300 text-sm">Locked</span>
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
