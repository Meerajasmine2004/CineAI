import express from 'express';
import { createBooking, getMyBookings, getBookingById, cancelBooking, getOccupiedSeats, getBookedSeats } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new booking
router.post('/', protect, createBooking);

// Get all bookings for logged-in user
router.get('/my', protect, getMyBookings);

// Get single booking by ID
router.get('/:id', protect, getBookingById);

// Get occupied seats for a specific show
router.get('/occupied', getOccupiedSeats);

// Get permanently booked seats
router.get('/seats', protect, getBookedSeats);

// Cancel booking
router.delete('/:id', protect, cancelBooking);

export default router;
