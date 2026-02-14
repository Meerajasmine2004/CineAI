import Movie from '../models/Movie.js';

// Get all movies
export const getAllMovies = async (req, res) => {
  try {
    const { page = 1, limit = 20, genre, language, isComingSoon } = req.query;
    
    // Build query
    const query = {};
    
    if (genre) {
      query.genre = { $in: [genre] };
    }
    
    if (language) {
      query.language = { $in: [language] };
    }
    
    if (isComingSoon !== undefined) {
      query.isComingSoon = isComingSoon === 'true';
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Get movies with pagination
    const movies = await Movie.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination info
    const total = await Movie.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: movies
    });
  } catch (error) {
    console.error('Get all movies error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching movies'
    });
  }
};

// Get single movie by ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: movie
    });
  } catch (error) {
    console.error('Get movie by ID error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid movie ID'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while fetching movie'
    });
  }
};
