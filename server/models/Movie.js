import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Movie description is required'],
    trim: true
  },
  poster: {
    type: String,
    required: [true, 'Movie poster URL is required'],
    trim: true
  },
  genre: [{
    type: String,
    required: [true, 'At least one genre is required']
  }],
  language: [{
    type: String,
    required: [true, 'At least one language is required']
  }],
  duration: {
    type: Number,
    required: [true, 'Movie duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required']
  },
  isComingSoon: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add text index for search functionality
movieSchema.index({ title: 'text', description: 'text' });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
