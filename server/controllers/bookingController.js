import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { movie, theatre, bookingDate, showTime, seats } = req.body;

    // Validate required fields
    if (!movie || !theatre || !bookingDate || !showTime || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Movie, theatre, booking date, show time, and seats are required'
      });
    }

    // Check if movie exists
    const existingMovie = await Movie.findById(movie);
    if (!existingMovie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    // Calculate total price based on seat rows (INR pricing)
    let totalPrice = 0;

    seats.forEach(seat => {
      const row = seat.charAt(0).toUpperCase();

      if (["A", "B", "C"].includes(row)) {
        totalPrice += 200; // Normal
      } else if (["D", "E", "F"].includes(row)) {
        totalPrice += 250; // Premium
      } else if (["G", "H", "I", "J"].includes(row)) {
        totalPrice += 350; // VIP
      }
    });

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      movie,
      theatre,
      bookingDate: new Date(bookingDate),
      showTime,
      seats,
      totalPrice,
      bookingStatus: 'confirmed'
    });

    await booking.save();

    await booking.populate('movie');

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating booking'
    });
  }
};


// Get all bookings for logged-in user
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching bookings'
    });
  }
};

// Get single booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('movie')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if booking belongs to logged-in user
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching booking'
    });
  }
};

// Cancel booking (hard delete)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully"
    });

  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// Get occupied seats for a specific show
export const getOccupiedSeats = async (req, res) => {
  try {
    const { movieId, theatre, date, showTime } = req.query;

    // Find all confirmed bookings for this specific show
    const bookings = await Booking.find({
      movie: movieId,
      theatre: theatre,
      bookingDate: new Date(date),
      showTime: showTime,
      bookingStatus: 'confirmed'
    }).select('seats');

    // Extract all booked seats
    const occupiedSeats = bookings.reduce((seats, booking) => {
      return seats.concat(booking.seats);
    }, []);

    res.status(200).json({
      success: true,
      data: occupiedSeats
    });

  } catch (error) {
    console.error("Get occupied seats error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};
