import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import SeatLock from '../models/SeatLock.js';
import { io } from '../server.js';

// Create a new booking
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { movie, theatre, bookingDate, showTime, seats } = req.body;

    // Validate required fields
    if (!movie || !theatre || !bookingDate || !showTime || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Movie, theatre, booking date, show time, and seats are required'
      });
    }

    // Check if movie exists (handle both ID and title)
    let existingMovie;
    if (mongoose.Types.ObjectId.isValid(movie)) {
      // If movie is a valid ObjectId, search by ID
      existingMovie = await Movie.findById(movie);
    } else {
      // If movie is a string (title), search by title
      existingMovie = await Movie.findOne({ title: movie });
    }
    
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

    // Start transaction
    await session.withTransaction(async () => {
      // Check for double booking conflicts within transaction
      const existingBookings = await Booking.find({
        movie,
        theatre,
        showTime,
        bookingDate: new Date(bookingDate),
        bookingStatus: "confirmed"
      }).session(session);

      const alreadyBookedSeats = existingBookings.flatMap(b => b.seats);

      const conflictSeats = seats.filter(seat =>
        alreadyBookedSeats.includes(seat)
      );

      if (conflictSeats.length > 0) {
        throw new Error(`Seats already booked: ${conflictSeats.join(", ")}`);
      }

      // Create booking within transaction
      const booking = new Booking({
        user: req.user._id,
        movie: existingMovie._id, // Use actual movie ID from found movie
        theatre,
        bookingDate: new Date(bookingDate),
        showTime,
        seats,
        totalPrice,
        bookingStatus: 'confirmed'
      });

      await booking.save({ session });

      // Emit socket event (outside transaction but after successful save)
      try {
        io.emit("seatBooked", {
          seatIds: seats
        });
      } catch (err) {
        console.error("Socket emit error:", err);
      }

      res.status(201).json({
        success: true,
        data: booking,
        message: "Booking created successfully"
      });
    });

  } catch (error) {
    console.error('Create booking error:', error);
    
    // Handle transaction errors
    if (error.message.includes('Seats already booked')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while creating booking'
    });
  } finally {
    // Always end session
    await session.endSession();
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

    io.emit("seatCancelled", {
      seats: booking.seats,
      movie: booking.movie.toString(),
      theatre: booking.theatre,
      showTime: booking.showTime,
      bookingDate: booking.bookingDate
    });

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

    // Add currently locked seats from MongoDB collection
    const activeLocks = await SeatLock.find({
      expiresAt: { $gt: new Date() }
    });

    const lockedSeats = [];
    activeLocks.forEach(lock => {
      const [keyMovieId, keyTheatre, keyShowTime, keyDate, seat] = lock.key.split('_');
      if (
        keyMovieId === movieId &&
        keyTheatre === theatre &&
        keyShowTime === showTime &&
        keyDate === date
      ) {
        lockedSeats.push(seat);
      }
    });

    // Combine booked and locked seats
    const allOccupiedSeats = [...occupiedSeats, ...lockedSeats];

    res.status(200).json({
      success: true,
      data: allOccupiedSeats
    });

  } catch (error) {
    console.error('Get occupied seats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching occupied seats'
    });
  }
};

export const getBookedSeats = async (req, res) => {
  try {
    const { movieId, theatre, showTime, bookingDate } = req.query;

    if (!movieId || !theatre || !showTime || !bookingDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters"
      });
    }

    console.log("Fetching booked seats:", movieId, theatre, showTime, bookingDate);

    const bookings = await Booking.find({
      movie: movieId,
      theatre: theatre,
      showTime: showTime,
      bookingDate: new Date(bookingDate),
      bookingStatus: "confirmed"
    });

    const bookedSeats = bookings.flatMap(b => b.seats || []);

    return res.json({
      success: true,
      bookedSeats
    });

  } catch (error) {
    console.error("Error fetching booked seats:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch booked seats"
    });
  }
};
