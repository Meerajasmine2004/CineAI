import express from 'express';
import { getRecommendations, getBecauseYouWatched } from '../services/recommendationService.js';

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

export default router;
