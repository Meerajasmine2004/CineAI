import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Film,
  ArrowLeft,
  Ticket,
  Check,
  MapPin
} from "lucide-react";
import { io } from "socket.io-client";
import api from "../services/api";
import toast from "react-hot-toast";

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get current user
  const storedUser = localStorage.getItem("user");
  const user = storedUser && storedUser !== "undefined" && storedUser !== "null" ? JSON.parse(storedUser) : null;
  const currentUserId = user?._id;

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedShowTime, setSelectedShowTime] = useState("");
  const [selectedTheatre, setSelectedTheatre] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const [bookedSeats, setBookedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState({});
  const [seats, setSeats] = useState([]);
  const [recommendedSeats, setRecommendedSeats] = useState([]);
  const [aiRecommendedSeats, setAiRecommendedSeats] = useState([]);
  const [aiTheatre, setAiTheatre] = useState(null);

  const [socket, setSocket] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [seatCount, setSeatCount] = useState(1);

  const rows = ["A","B","C","D","E","F","G","H","I","J"];
  const seatsPerRow = 14;

  // Initialize seats state
  useEffect(() => {
    const initialSeats = [];
    rows.forEach(row => {
      for (let i = 1; i <= seatsPerRow; i++) {
        initialSeats.push({
          id: `${row}${i}`,
          row: row,
          number: i,
          isLocked: false,
          isBooked: false,
          isSelected: false,
          lockedBy: null
        });
      }
    });
    setSeats(initialSeats);
  }, []);

  const showTimes = [
    "10:00 AM",
    "1:00 PM",
    "4:00 PM",
    "7:00 PM",
    "10:00 PM"
  ];

  const theatres = [
    "PVR Phoenix",
    "INOX Marina Mall",
    "AGS Villivakkam",
    "Luxe Cinemas",
    "SPI Palazzo"
  ];

  /* ---------------- SOCKET ---------------- */

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Capture socket ID when connection is established
    newSocket.on("connect", () => {
      setSocketId(newSocket.id);
      console.log("Socket connected with ID:", newSocket.id);
    });

    // Listen for seat updates
    newSocket.on("seatUpdate", ({ seatId, lockedBy }) => {
      console.log("Seat update:", seatId, "locked by:", lockedBy);
      console.log("Current user:", currentUserId);
      
      // Update seat state with lock information
      setSeats(prevSeats =>
        prevSeats.map(seat =>
          seat.id === seatId
            ? { ...seat, isLocked: true, lockedBy }
            : seat
        )
      );
    });

    // Listen for seat booked events
    newSocket.on("seatBooked", ({ seatIds }) => {
      console.log("Seats booked:", seatIds);
      
      // Update seat state for booked seats
      setSeats(prevSeats =>
        prevSeats.map(seat =>
          seatIds.includes(seat.id)
            ? { ...seat, isBooked: true, isLocked: false }
            : seat
        )
      );
    });

    // Listen for unlocked seats
    newSocket.on("seatUnlocked", ({ movieId, showTime, seat }) => {
      if (movieId === id && showTime === selectedShowTime) {
        setLockedSeats(prev => {
          const updated = { ...prev };
          delete updated[seat];
          return updated;
        });
      }
    });

    // Listen for seat already locked
    newSocket.on("seatAlreadyLocked", ({ seat }) => {
      toast.error(`Seat ${seat} is already locked by another user`);
    });

    // Listen for seat booked events
    newSocket.on("seatBooked", ({ seats: bookedSeats, movieId, theatre, showTime, bookingDate }) => {
      console.log("Seats booked:", bookedSeats);
      
      // Update booked seats state if this is for the current movie/showtime
      if (movieId === id && showTime === selectedShowTime && theatre === selectedTheatre && bookingDate === bookingDate) {
        setBookedSeats(prev => [...prev, ...bookedSeats]);
        
        // Remove from locked seats since they're now booked
        setLockedSeats(prev => {
          const updated = { ...prev };
          bookedSeats.forEach(seat => {
            delete updated[seat];
          });
          return updated;
        });
        
        // Remove from selected seats if user had them selected
        setSelectedSeats(prev => prev.filter(seat => !bookedSeats.includes(seat)));
        
        toast.success(`Seats ${bookedSeats.join(', ')} have been booked`);
      }
    });

    // Cleanup: unlock all seats when component unmounts
    return () => {
      // Remove all event listeners
      newSocket.off("connect");
      newSocket.off("seatUpdate");
      newSocket.off("seatBooked");
      newSocket.off("seatUnlocked");
      newSocket.off("seatAlreadyLocked");
      
      // Unlock all selected seats
      selectedSeats.forEach(seat => {
        newSocket.emit("unlockSeat", {
          movieId: id,
          theatre: selectedTheatre,
          showTime: selectedShowTime,
          bookingDate,
          seat
        });
      });
      newSocket.disconnect();
    };
  }, []);

  /* ---------------- MOVIE ---------------- */

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      const res = await api.get(`/movies/${id}`);
      if (res.data.success) setMovie(res.data.data);
    } catch (err) {
      setError("Failed to load movie");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- AI THEATRE ---------------- */

  useEffect(() => {
    const fetchAi = async () => {
      try {
        const res = await api.get(`/recommendations/theatre/${id}`);
        if (res.data.success) setAiTheatre(res.data.data?.theatre);
      } catch {}
    };

    fetchAi();
  }, [id]);

  /* ---------------- RECOMMENDED SEATS ---------------- */

  const fetchRecommendedSeats = async () => {
    if (!selectedTheatre || !selectedShowTime) {
      toast.error("Select theatre and showtime");
      return;
    }

    try {
      const res = await api.get("/recommendations/seats", {
        params: {
          movieId: id,
          theatre: selectedTheatre,
          showTime: selectedShowTime,
          seatCount: seatCount
        }
      });

      if (res.data.success) {
        setRecommendedSeats(res.data.data);
      }
    } catch {
      toast.error("AI seat suggestion failed");
    }
  };

  /* ---------------- BOOKED SEATS ---------------- */

  useEffect(() => {
    if (!selectedShowTime || !selectedTheatre || !bookingDate) return;

    fetchBookedSeats();
  }, [selectedShowTime, selectedTheatre, bookingDate]);

  const fetchBookedSeats = async () => {
    try {
      const res = await api.get("/bookings/seats", {
        params: {
          movieId: id,
          theatre: selectedTheatre,
          showTime: selectedShowTime,
          bookingDate: bookingDate
        }
      });

      if (res.data.success) {
        setBookedSeats(res.data.data || []);
      }
    } catch {}
  };

  /* ---------------- SEAT CLICK ---------------- */

  const handleSeatClick = (seat) => {

    if (!selectedShowTime || !selectedTheatre || !bookingDate) {
      toast.error("Select date, theatre and showtime first");
      return;
    }

    if (bookedSeats.includes(seat)) {
      toast.error("Seat already booked");
      return;
    }

    // Check if seat is locked by another user (only block others)
    const lockedBy = lockedSeats[seat];
    if (lockedBy && lockedBy !== currentUserId && !selectedSeats.includes(seat)) {
      console.log("Seat locked by:", lockedBy);
      console.log("Current user:", currentUserId);
      toast.error("Seat already locked by another user");
      return;
    }

    const row = seat.charAt(0);
    const seatNumber = parseInt(seat.slice(1));

    const seatsToSelect = [];

    for (let i = 0; i < seatCount; i++) {
      const nextSeatNumber = seatNumber + i;
      const nextSeat = `${row}${nextSeatNumber}`;

      if (nextSeatNumber > seatsPerRow) {
        toast.error("Not enough adjacent seats available");
        return;
      }

      // Check if adjacent seat is booked or locked by another user
      const adjacentLockedBy = lockedSeats[nextSeat];
      if (bookedSeats.includes(nextSeat) || (adjacentLockedBy && adjacentLockedBy !== currentUserId)) {
        toast.error("Adjacent seats not available");
        return;
      }

      seatsToSelect.push(nextSeat);
    }

    // unlock previous seats
    selectedSeats.forEach(s => {
      socket.emit("unlockSeat", {
        movieId: id,
        theatre: selectedTheatre,
        showTime: selectedShowTime,
        bookingDate,
        seat: s
      });
    });

    // select new seats
    setSelectedSeats(seatsToSelect);

    // lock seats
    seatsToSelect.forEach(s => {
      socket.emit("lockSeat", {
        movieId: id,
        theatre: selectedTheatre,
        showTime: selectedShowTime,
        bookingDate,
        seat: s,
        userId: currentUserId
      });
    });

  };

  /* ---------------- PRICE ---------------- */

  const calculateTotalPrice = () => {
    let total = 0;

    selectedSeats.forEach(seat => {
      const row = seat.charAt(0);

      if (["A","B","C"].includes(row)) total += 200;  // Regular
      else if (["D","E"].includes(row)) total += 250;  // Premium
      else total += 350;                               // VIP (F-J)
    });

    return total;
  };

  /* ---------------- SEAT STYLE ---------------- */

  const getSeatType = (row) => {
    if (["A", "B", "C"].includes(row)) return "regular";    // ₹200
    if (["D", "E"].includes(row)) return "premium";        // ₹250
    return "vip";                                           // ₹350 (F-J)
  };

  const getSeatClass = (seat) => {
    // BOOKED seats (RED) - Highest priority
    if (seat.isBooked)
      return "bg-red-600 text-white cursor-not-allowed";

    // LOCKED seats (YELLOW) - All locked seats same color
    if (seat.isLocked && seat.lockedBy !== currentUserId)
      return "bg-yellow-400 text-black cursor-not-allowed";

    // SELECTED seats (GREEN)
    if (selectedSeats.includes(seat.id))
      return "bg-green-600 text-white";

    // AI RECOMMENDED seats (PURPLE)
    if (recommendedSeats.includes(seat.id))
      return "bg-purple-600 text-white ring-2 ring-purple-300 scale-110";

    // Seat category styles based on row
    if (["A","B","C"].includes(seat.row))
      return "border border-gray-500 text-gray-300 hover:bg-gray-700";

    if (["D","E","F"].includes(seat.row))
      return "border border-blue-500 text-blue-300 hover:bg-blue-700";

    return "border border-yellow-400 text-yellow-300 hover:bg-yellow-700";
  };

  /* ---------------- BOOKING ---------------- */

  const confirmBooking = () => {
    if (!selectedSeats.length) {
      toast.error("Select seats");
      return;
    }

    // Prepare booking data for payment page
    const bookingData = {
      movie: id,
      theatre: selectedTheatre,
      showTime: selectedShowTime,
      bookingDate,
      seats: selectedSeats,
      totalPrice: calculateTotalPrice()
    };

    // Redirect to payment page with booking data
    navigate("/payment", {
      state: bookingData
    });
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        Loading...
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
  <div className="min-h-screen bg-dark-900 text-white py-8">

    <div className="max-w-7xl mx-auto px-4">

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT PANEL */}
        <div className="lg:col-span-1">
          <div className="glass p-6 rounded-xl">

            <h2 className="text-xl font-bold mb-6">
              Booking Details
            </h2>

            {/* DATE */}
            <div className="mb-4">
              <label className="block text-sm mb-2">
                Select Booking Date
              </label>

              <input
                type="date"
                value={bookingDate}
                onChange={(e)=>{
                  const date=e.target.value
                  setBookingDate(date)

                  const formattedDay=new Date(date).toLocaleDateString("en-IN",{
                    weekday:"long",
                    day:"numeric",
                    month:"short",
                    year:"numeric"
                  })

                  setSelectedDay(formattedDay)
                }}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-3 bg-dark-800 rounded"
              />
            </div>

            {/* THEATRE */}
            <select
              value={selectedTheatre}
              onChange={(e)=>setSelectedTheatre(e.target.value)}
              className="w-full mb-4 p-3 bg-dark-800 rounded"
            >
              <option value="">Choose theatre</option>

              {theatres.map(t=>(
                <option key={t} value={t}>
                  {t} {aiTheatre===t && "✨"}
                </option>
              ))}
            </select>

            {/* SHOWTIME */}
            <select
              value={selectedShowTime}
              onChange={(e)=>setSelectedShowTime(e.target.value)}
              className="w-full mb-6 p-3 bg-dark-800 rounded"
            >
              <option value="">Choose showtime</option>

              {showTimes.map(t=>(
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* SELECTED INFO */}
            <div className="space-y-4">

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-cinema-400 mt-1" />
                <div>
                  <p className="text-sm text-dark-400">Selected Date</p>
                  <p className="text-white font-medium">{selectedDay || "Not selected"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cinema-400 mt-1" />
                <div>
                  <p className="text-sm text-dark-400">Theatre</p>
                  <p className="text-white font-medium">{selectedTheatre || "Not selected"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-cinema-400 mt-1" />
                <div>
                  <p className="text-sm text-dark-400">Show Time</p>
                  <p className="text-white font-medium">{selectedShowTime || "Not selected"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-cinema-400 mt-1" />
                <div>
                  <p className="text-sm text-dark-400">Seats Selected</p>
                  <p className="text-white font-medium">
                    {selectedSeats.length>0
                      ? `${selectedSeats.join(", ")} (${selectedSeats.length} seats)`
                      : "None"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-cinema-400 text-lg font-bold">₹</span>
                <div>
                  <p className="text-sm text-dark-400">Total Price</p>
                  <p className="text-white font-medium">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR"
                    }).format(calculateTotalPrice())}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>


        {/* RIGHT PANEL */}
        <div className="lg:col-span-2">

          <div className="glass p-6 rounded-xl">

            {/* SEAT COUNT */}
            <div className="mb-6">

              <label className="block text-sm mb-3">
                Select Number of Seats
              </label>

              <div className="flex gap-2 flex-wrap">

                {[1,2,3,4,5,6].map(count=>(
                  <button
                    key={count}
                    onClick={()=>setSeatCount(count)}
                    className={`px-4 py-2 rounded ${
                      seatCount===count
                        ? "bg-cinema-600"
                        : "bg-dark-800 hover:bg-dark-700"
                    }`}
                  >
                    {count}
                  </button>
                ))}

              </div>

            </div>

            {/* SEAT TYPE LEGEND */}
            <div className="flex justify-center gap-6 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-500 rounded"></div>
                <span>Normal ₹200</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-blue-500 rounded"></div>
                <span>Premium ₹250</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-yellow-400 rounded"></div>
                <span>VIP ₹350</span>
              </div>
            </div>


            {/* AI BUTTON */}
            <button
              onClick={fetchRecommendedSeats}
              className="bg-purple-600 px-4 py-2 rounded mb-6"
            >
              ✨ Suggest Best Seats
            </button>


            {/* SCREEN */}
            <div className="bg-dark-700 h-2 rounded mb-2"></div>
            <p className="text-center text-sm mb-6">SCREEN</p>


            {/* SEAT GRID */}
            <div className="space-y-2">

              {rows.map(row=>(
                <div key={row} className="flex gap-2 items-center">

                  <span className="w-4">{row}</span>

                  {seats
                    .filter(seat => seat.row === row)
                    .map(seat => {
                      const aisleGap = seat.number === 8 ? "ml-6" : ""
                      
                      return(
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat.id)}
                          className={`relative w-10 h-10 rounded text-sm ${getSeatClass(seat)} ${aisleGap}`}
                        >
                          {seat.number}

                          {recommendedSeats.includes(seat.id)&&(
                            <span className="absolute -top-1 -right-1 text-yellow-300 text-xs">
                              ✨
                            </span>
                          )}

                        </button>
                      )
                    })}

                </div>
              ))}

            </div>


            {/* LEGEND */}
            <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
              <div className="legend-available flex items-center gap-2">
                <span className="seat-box regular"></span>
                <span className="seat-box premium"></span>
                <span className="seat-box vip"></span>
                <span className="legend-label">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{backgroundColor: '#22c55e'}}></div>
                <span className="text-sm">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{backgroundColor: '#facc15'}}></div>
                <span className="text-sm">Locked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{backgroundColor: '#ef4444'}}></div>
                <span className="text-sm">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{backgroundColor: '#a855f7'}}></div>
                <span className="text-sm">AI Recommended</span>
              </div>
            </div>

          </div>

        </div>

      </div>


      {/* CONFIRM BUTTON */}
      <div className="mt-8 text-center">

        <button
          onClick={confirmBooking}
          className="btn-primary px-8 py-3"
        >
          {bookingLoading ? "Processing..." : "Confirm Booking"}
        </button>

      </div>

    </div>

  </div>
)
};

export default SeatSelection;

// Add CSS styles for seat states
const style = document.createElement('style');
style.textContent = `
  .seat-box {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    margin-right: 6px;
    display: inline-block;
  }

  .seat-box.regular {
    border: 1px solid #e5e7eb;
  }

  .seat-box.premium {
    border: 1px solid #3b82f6;
  }

  .seat-box.vip {
    border: 1px solid #facc15;
  }

  .legend-available {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .legend-label {
    margin-left: 8px;
    font-size: 14px;
    color: white;
  }

  .seat.available.regular {
    background: transparent;
    border: 1px solid #e5e7eb;
    color: white;
    cursor: pointer;
  }
  
  .seat.available.premium {
    background: transparent;
    border: 1px solid #3b82f6;
    color: #3b82f6;
    cursor: pointer;
  }
  
  .seat.available.vip {
    background: transparent;
    border: 1px solid #facc15;
    color: #facc15;
    cursor: pointer;
  }
  
  .seat.selected {
    background: #22c55e;
    color: white;
    cursor: pointer;
  }
  
  .seat.locked {
    background: #facc15;
    color: black;
    cursor: not-allowed;
  }
  
  .seat.booked {
    background: #ef4444;
    color: white;
    cursor: not-allowed;
  }
  
  .seat.recommended {
    background: #a855f7;
    color: white;
    cursor: pointer;
  }
`;
document.head.appendChild(style);