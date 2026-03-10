import { useState, useEffect } from "react";
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
  const [recommendedSeats, setRecommendedSeats] = useState([]);
  const [aiTheatre, setAiTheatre] = useState(null);

  const [socket, setSocket] = useState(null);
  const [seatCount, setSeatCount] = useState(1);

  const rows = ["A","B","C","D","E","F","G","H","I","J"];
  const seatsPerRow = 14;

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

    newSocket.on("seatLocked", ({ seat, lockedBy }) => {
      setLockedSeats(prev => ({ ...prev, [seat]: lockedBy }));
    });

    newSocket.on("seatUnlocked", ({ seat }) => {
      setLockedSeats(prev => {
        const updated = { ...prev };
        delete updated[seat];
        return updated;
      });
    });

    return () => newSocket.disconnect();
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
    if (!selectedShowTime || !selectedTheatre) return;

    fetchBookedSeats();
  }, [selectedShowTime, selectedTheatre]);

  const fetchBookedSeats = async () => {
    try {
      const res = await api.get("/bookings/seats", {
        params: {
          movieId: id,
          theatre: selectedTheatre,
          showTime: selectedShowTime
        }
      });

      if (res.data.success) {
        setBookedSeats(res.data.data || []);
      }
    } catch {}
  };

  /* ---------------- SEAT CLICK ---------------- */

  const handleSeatClick = seat => {
    if (bookedSeats.includes(seat)) return;

    // Extract row and seat number
    const row = seat.charAt(0);
    const seatNumber = parseInt(seat.substring(1));

    // Clear existing selections
    setSelectedSeats([]);
    socket?.emit("unlockSeat", { seat: selectedSeats[0] });

    // Generate adjacent seats
    const adjacentSeats = [];
    for (let i = 0; i < seatCount; i++) {
      const newSeatNumber = seatNumber + i;
      const newSeat = `${row}${newSeatNumber}`;
      
      // Check if seat exists in row
      if (newSeatNumber > seatsPerRow) {
        toast.error("Not enough adjacent seats available");
        return;
      }
      
      // Check if seat is available
      if (bookedSeats.includes(newSeat) || 
          (lockedSeats[newSeat] && lockedSeats[newSeat] !== socket.id)) {
        toast.error("Not enough adjacent seats available");
        return;
      }
      
      adjacentSeats.push(newSeat);
    }

    // Select all adjacent seats
    setSelectedSeats(adjacentSeats);
    
    // Lock each seat
    adjacentSeats.forEach(seat => {
      socket?.emit("lockSeat", { seat });
    });
  };

  /* ---------------- PRICE ---------------- */

  const calculateTotalPrice = () => {
    let total = 0;

    selectedSeats.forEach(seat => {
      const row = seat.charAt(0);

      if (["A","B","C"].includes(row)) total += 200;
      else if (["D","E","F"].includes(row)) total += 250;
      else total += 350;
    });

    return total;
  };

  /* ---------------- SEAT STYLE ---------------- */

  const getSeatClass = (seat,row) => {

    if (bookedSeats.includes(seat))
      return "bg-red-600 text-white cursor-not-allowed";

    if (selectedSeats.includes(seat))
      return "bg-green-600 text-white";

    if (recommendedSeats.includes(seat))
      return "bg-purple-600 text-white ring-2 ring-purple-300 scale-110";

    if (["A","B","C"].includes(row))
      return "border border-gray-500 text-gray-300 hover:bg-gray-700";

    if (["D","E","F"].includes(row))
      return "border border-blue-500 text-blue-300 hover:bg-blue-700";

    return "border border-yellow-400 text-yellow-300 hover:bg-yellow-700";
  };

  /* ---------------- BOOKING ---------------- */

  const confirmBooking = async () => {

    if (!selectedSeats.length) {
      toast.error("Select seats");
      return;
    }

    try {
      setBookingLoading(true);

      const res = await api.post("/bookings",{
        movie:id,
        theatre:selectedTheatre,
        showTime:selectedShowTime,
        bookingDate,
        seats:selectedSeats
      });

      if(res.data.success){
        toast.success("Booking Confirmed");
        navigate("/bookings");
      }

    } catch {
      toast.error("Booking failed");
    } finally {
      setBookingLoading(false);
    }
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

                  {Array.from({length:seatsPerRow},(_,i)=>{

                    const num=i+1
                    const seat=`${row}${num}`
                    const aisleGap=num===8?"ml-6":""

                    return(
                      <button
                        key={seat}
                        onClick={()=>handleSeatClick(seat)}
                        className={`relative w-10 h-10 rounded text-sm ${getSeatClass(seat,row)} ${aisleGap}`}
                      >
                        {num}

                        {recommendedSeats.includes(seat)&&(
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
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
                <span className="text-sm">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-600 rounded"></div>
                <span className="text-sm">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500 text-black rounded"></div>
                <span className="text-sm">Locked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
                <span className="text-sm">AI Recommended ✨</span>
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