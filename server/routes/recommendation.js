import express from 'express';
import { getRecommendations, getBecauseYouWatched, getRecommendedTheatres, getRecommendedTheatre, getRecommendedSeats } from '../services/recommendationService.js';

const router = express.Router();

// GET /api/recommendations/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId parameter
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Get recommendations from service
    const recommendations = await getRecommendations(userId);

    // Return recommendations
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

// GET /api/recommendations/because-you-watched/:userId
router.get('/because-you-watched/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId parameter
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Get "Because You Watched" recommendations from service
    const recommendations = await getBecauseYouWatched(userId);

    // Return recommendations
    res.status(200).json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });

  } catch (error) {
    console.error('Error in "Because You Watched" recommendation route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate "Because You Watched" recommendations'
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

// GET /api/recommendations/seats
router.get("/seats", async (req, res) => {
  try {
    const { movieId, theatre, showTime } = req.query;

    console.log("Seat recommendation request:", movieId, theatre, showTime);

    const seats = await getRecommendedSeats(movieId, theatre, showTime);

    res.json({
      success: true,
      data: seats
    });

  } catch (error) {
    console.error("Seat recommendation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate seat recommendations"
    });
  }
});

export default router;
