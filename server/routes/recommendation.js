import express from 'express';
import { getRecommendations, getRecommendedTheatres, getRecommendedTheatre, getRecommendedSeats } from '../services/recommendationService.js';

const router = express.Router();

// GET /api/recommendations/seats
router.get("/seats", async (req, res) => {
  try {
    const { movieId, theatre, showTime, seatCount } = req.query;

    console.log("Smart seat recommendation request:", movieId, theatre, showTime, seatCount);

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

    const recommendations = await getRecommendations(userId);

    res.status(200).json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });

  } catch (error) {
    console.error('Error in recommendation route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations'
    });
  }
});

export default router;