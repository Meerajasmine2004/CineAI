import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import mongoose from 'mongoose';

// Helper function to get user preferences
const getUserPreferences = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return {
        preferredGenres: [],
        preferredLanguages: []
      };
    }

    return {
      preferredGenres: user.preferredGenres || [],
      preferredLanguages: user.preferredLanguages || []
    };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return {
      preferredGenres: [],
      preferredLanguages: []
    };
  }
};

// Helper function to get user booking history
const getUserHistory = async (userId) => {
  try {
    const bookings = await Booking.find({ user: userId })
      .populate('movie', 'genre language title')
      .sort({ createdAt: -1 })
      .limit(20);

    return bookings.map(booking => booking.movie);
  } catch (error) {
    console.error('Error fetching user history:', error);
    return [];
  }
};

// Helper function to get user's booked movie IDs
const getUserBookedMovieIds = async (userId) => {
  try {
    const bookings = await Booking.find({ userId }).populate("movieId");
    const bookedMovieIds = bookings.map(b => b.movieId._id.toString());
    return bookedMovieIds;
  } catch (error) {
    console.error('Error fetching booked movie IDs:', error);
    return [];
  }
};

// Helper function to get trending scores (booking count for each movie)
const getTrendingScores = async () => {
  try {
    const bookingCounts = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: '$movie', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Convert to Map for easy lookup
    const trendingMap = new Map();
    bookingCounts.forEach(item => {
      trendingMap.set(item._id.toString(), item.count);
    });

    return trendingMap;
  } catch (error) {
    console.error('Error fetching trending scores:', error);
    return new Map();
  }
};

// Helper function to calculate recommendation score
const calculateScore = (movie, userPreferences, userHistory, trendingScores) => {
  let score = 0;

  // +3 if movie genre matches user preferredGenres
  const genreMatches = movie.genre.filter(genre => 
    userPreferences.preferredGenres.includes(genre)
  );
  score += genreMatches.length * 3;

  // +2 if movie language matches preferredLanguages
  if (userPreferences.preferredLanguages.includes(movie.language)) {
    score += 2;
  }

  // +1 for each genre similarity with previously booked movies
  const bookedGenres = userHistory.flatMap(historyMovie => 
    historyMovie.genre || []
  );
  const genreSimilarities = movie.genre.filter(genre => 
    bookedGenres.includes(genre)
  );
  score += genreSimilarities.length * 1;

  // +1 for trending score (booking count)
  const trendingScore = trendingScores.get(movie._id.toString()) || 0;
  score += trendingScore * 1;

  return score;
};

// Main function to get recommendations
export const getRecommendations = async (userId) => {
  try {
    // 1. Fetch user preferences
    const preferences = await getUserPreferences(userId);

    // 2. Fetch user booking history
    const history = await getUserHistory(userId);

    // 3. Fetch the user's bookings using correct field names
    const bookings = await Booking.find({ user: userId });

    // 4. Extract booked movie IDs correctly
    const bookedMovieIds = bookings
      .map(b => b.movie?.toString())
      .filter(Boolean);

    // 5. Debug log
    console.log("Booked movie IDs:", bookedMovieIds);

    // 6. Exclude those movies when fetching movies
    const movies = await Movie.find({
      _id: { $nin: bookedMovieIds }
    });

    // 7. Fetch trending scores
    const trendingScores = await getTrendingScores();

    // 8. Run the recommendation scoring only on the filtered movie list
    const scoredMovies = movies.map(movie => {
      const score = calculateScore(movie, preferences, history, trendingScores);
      return {
        ...movie.toObject(),
        recommendationScore: score
      };
    });

    // 9. Sort by recommendationScore descending and return top 5
    const sortedMovies = scoredMovies.sort((a, b) => 
      b.recommendationScore - a.recommendationScore
    );

    // 10. Return top 5 recommended movies
    return sortedMovies.slice(0, 5);

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

// New function for theatre recommendations
export const getRecommendedTheatres = async (movieId) => {
  try {
    // Use MongoDB aggregation on the Booking collection
    const theatreCounts = await Booking.aggregate([
      { 
        $match: { 
          movie: new mongoose.Types.ObjectId(movieId), 
          bookingStatus: "confirmed" 
        } 
      },
      { $group: { _id: "$theatre", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Convert the result into the required format
    const recommendedTheatres = theatreCounts.map(item => ({
      theatre: item._id,
      count: item.count
    }));

    // Return the top 3 theatres
    return recommendedTheatres.slice(0, 3);

  } catch (error) {
    console.error('Error generating theatre recommendations:', error);
    return [];
  }
};

// New function to get the single most popular theatre
export const getRecommendedTheatre = async (movieId) => {
  try {
    // Use MongoDB aggregation on Booking collection
    const theatreCounts = await Booking.aggregate([
      { 
        $match: { 
          movie: new mongoose.Types.ObjectId(movieId), 
          bookingStatus: "confirmed" 
        } 
      },
      { $group: { _id: "$theatre", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    // Extract the theatre name
    const recommendedTheatre = theatreCounts[0]?._id || null;

    // Return only the theatre name
    return {
      theatre: recommendedTheatre
    };

  } catch (error) {
    console.error('Error generating recommended theatre:', error);
    return {
      theatre: null
    };
  }
};

// New function for AI seat recommendations
export const getRecommendedSeats = async (movieId, theatre, showTime, seatCount = 3) => {
  try {
    const bookings = await Booking.find({
      movie: movieId,
      theatre: theatre,
      showTime: showTime,
      bookingStatus: "confirmed"
    });

    const bookedSeats = bookings.flatMap(b => b.seats || []);

    // Best viewing rows (middle rows)
    const bestRows = ["E", "F", "D", "G"];
    // Center seat numbers
    const centerSeats = [6, 7, 8, 9];
    
    // Generate all possible adjacent seat combinations
    const allRecommendations = [];
    
    for (const row of bestRows) {
      for (const startSeat of centerSeats) {
        const seats = [];
        let valid = true;
        
        for (let i = 0; i < seatCount; i++) {
          const seatNumber = startSeat + i;
          const seatId = `${row}${seatNumber}`;
          
          // Check if seat exists and is available
          if (seatNumber > 14 || bookedSeats.includes(seatId)) {
            valid = false;
            break;
          }
          
          seats.push(seatId);
        }
        
        if (valid) {
          // Score based on row preference and center position
          let score = 0;
          score += (4 - bestRows.indexOf(row)) * 10; // Row preference
          score += (4 - Math.abs(7.5 - (startSeat + seatCount/2))) * 5; // Center preference
          
          allRecommendations.push({ seats, score });
        }
      }
    }
    
    // Sort by score and return best recommendation
    allRecommendations.sort((a, b) => b.score - a.score);
    return allRecommendations[0]?.seats || [];

  } catch (error) {
    console.error("Seat recommendation error:", error);
    return [];
  }
};
