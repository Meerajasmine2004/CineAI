import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { updateProfile, getProfile } from '../controllers/userController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get current user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

export default router;
