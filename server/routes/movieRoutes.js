import express from 'express';
import { getAllMovies, getMovieById } from '../controllers/movieController.js';

const router = express.Router();

// GET /api/movies - Get all movies
router.get('/', getAllMovies);

// GET /api/movies/:id - Get single movie by ID
router.get('/:id', getMovieById);

export default router;
