import express from 'express';
import { createBooking, getMyBookings, getBookingById } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new booking
router.post('/', protect, createBooking);

// Get all bookings for logged-in user
router.get('/my', protect, getMyBookings);

// Get single booking by ID
router.get('/:id', protect, getBookingById);

export default router;
