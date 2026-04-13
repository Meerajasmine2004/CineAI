import express from 'express';
import axios from 'axios';
import { getRecommendedTheatres, getRecommendedTheatre, getRecommendedSeats } from '../services/recommendationService.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';

const router = express.Router();

// GET /api/recommendations/seats
router.get("/seats", async (req, res) => {
  try {
    const { movieId, theatre, showTime, seatCount, userType = 'general' } = req.query;

    console.log("Smart seat recommendation request:", movieId, theatre, showTime, seatCount, userType);

    // Use existing seat recommendation service for now
    const seats = await getRecommendedSeats(movieId, theatre, showTime, parseInt(seatCount) || 3);

    res.json({
      success: true,
      data: seats
    });

  } catch (error) {
    console.error("Smart seat recommendation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate seat recommendations"
    });
  }
});

// POST /api/recommendations/seat-score
router.post("/seat-score", async (req, res) => {
  try {
    const { seatGrid, bookedSeats, userType = 'general', seatCount } = req.body;

    if (!seatGrid || !bookedSeats || !userType || !seatCount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: seatGrid, bookedSeats, userType, seatCount'
      });
    }

    console.log(`Seat scoring request for ${userType}, ${seatCount} seats`);

    // Call Flask ML service for seat scoring
    const payload = {
      seatGrid,
      bookedSeats,
      userType,
      seatCount
    };

    const response = await axios.post('http://localhost:5001/seat-score', payload, {
      timeout: 5000, // 5 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log(`Seat scoring completed: ${response.data.result.seats}`);
      return res.json({
        success: true,
        data: response.data.result
      });
    } else {
      throw new Error('ML service returned unsuccessful response');
    }

  } catch (error) {
    console.error("Seat scoring error:", error);
    
    // Handle Flask service unavailable
    if (error.code === 'ECONNREFUSED') {
      console.log('Flask ML service unavailable for seat scoring');
      return res.status(200).json({
        success: true,
        data: { seats: [], score: 0, explanation: { reason: 'ML service unavailable' } },
        warning: 'ML service temporarily unavailable'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to score seats',
      details: error.message
    });
  }
});


// GET /api/recommendations/theatres/:movieId
router.get("/theatres/:movieId", async (req, res) => {
  const theatres = await getRecommendedTheatres(req.params.movieId);

  res.json({
    success: true,
    data: theatres
  });
});


// GET /api/recommendations/theatre/:movieId
router.get("/theatre/:movieId", async (req, res) => {
  const theatre = await getRecommendedTheatre(req.params.movieId);

  res.json({
    success: true,
    data: theatre
  });
});


// ⚠️ KEEP THIS LAST
// GET /api/recommendations/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    console.log(`Generating recommendations for user: ${userId}`);

    // Fetch user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Fetch user's booking history
    const bookings = await Booking.find({ user: userId })
      .populate('movie', 'genre language title')
      .sort({ createdAt: -1 })
      .limit(20);

    // Fetch all available movies
    const allMovies = await Movie.find();

    // Prepare data for Flask service
    const bookingHistory = bookings.map(booking => ({
      genres: booking.movie?.genre || [],
      language: booking.movie?.language || 'english'
    }));

    const allMoviesData = allMovies.map(movie => ({
      _id: movie._id.toString(),
      genre: movie.genre || [],
      language: movie.language || 'english',
      title: movie.title || 'Unknown'
    }));

    const payload = {
      userId: userId,
      userGenres: user.preferences?.genres || [],
      userLanguages: user.preferences?.languages || ['english'],
      bookingHistory: bookingHistory,
      allMovies: allMoviesData
    };

    console.log('Calling Flask ML service for recommendations...');
    
    // Call Flask ML service
    const response = await axios.post('http://localhost:5001/recommend', payload, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log(`Generated ${response.data.recommendations.length} recommendations`);
      return res.status(200).json({
        success: true,
        data: response.data.recommendations,
        count: response.data.recommendations.length
      });
    } else {
      throw new Error('ML service returned unsuccessful response');
    }

  } catch (error) {
    console.error('Error in recommendation route:', error);
    
    // Handle Flask service unavailable
    if (error.code === 'ECONNREFUSED') {
      console.log('Flask ML service unavailable, returning empty recommendations');
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        warning: 'ML service temporarily unavailable'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error.message
    });
  }
});

export default router;