import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { movieId, showTime, seats } = req.body;

    // Validate required fields
    if (!movieId || !showTime || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Movie ID, show time, and seats are required'
      });
    }

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    // Calculate total price (assuming $10 per seat)
    const totalPrice = seats.length * 10;

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      movie: movieId,
      showTime,
      seats,
      totalPrice,
      bookingStatus: 'confirmed'
    });

    await booking.save();

    // Populate movie details in response
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
