import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import mongoose from 'mongoose';

// Helper function to calculate score (still used by seat recommendations)
const calculateScore = (movie, userPreferences, userHistory, trendingScores) => {
  let score = 0;

  // +3 if movie genre matches user genres
  const genreMatches = movie.genre.filter(genre => 
    userPreferences.genres.includes(genre)
  );
  score += genreMatches.length * 3;

  // +2 if movie language matches languages
  if (userPreferences.languages.includes(movie.language)) {
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

  // +1 for trending score (booking count) - capped at 5
  const trendingScore = trendingScores.get(movie._id.toString()) || 0;
  score += Math.min(trendingScore, 5);

  return score;
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
export const getRecommendedSeats = async (movieId, theatre, showTime, seatCount = 3, userType = 'general') => {
  try {
    const bookings = await Booking.find({
      movie: movieId,
      theatre: theatre,
      showTime: showTime,
      bookingStatus: "confirmed"
    });

    const bookedSeats = bookings.flatMap(b => b.seats || []);

    // Define row and seat preferences based on user type
    let preferredRows, preferredSeats, scoringWeights;
    
    switch (userType) {
      case 'couple':
        // Couples prefer corner seats for privacy
        preferredRows = ["E", "F", "D", "G"];
        preferredSeats = [1, 2, 3, 4, 11, 12, 13, 14]; // Corner seats
        scoringWeights = {
          rowPreference: 10,
          positionPreference: 15, // Higher weight for corner preference
          centerPreference: 2
        };
        break;
        
      case 'elderly':
        // Elderly prefer lower rows for easy access
        preferredRows = ["A", "B", "C", "D"];
        preferredSeats = [6, 7, 8, 9]; // Center seats for better viewing
        scoringWeights = {
          rowPreference: 15, // Higher weight for lower rows
          positionPreference: 10,
          centerPreference: 8
        };
        break;
        
      case 'family':
        // Families prefer center rows for group seating
        preferredRows = ["D", "E", "F", "G"];
        preferredSeats = [5, 6, 7, 8, 9, 10]; // Center area for groups
        scoringWeights = {
          rowPreference: 10,
          positionPreference: 8,
          centerPreference: 12 // Higher weight for center preference
        };
        break;
        
      case 'budget':
        // Budget users prefer cheapest seats (Normal rows A-C)
        preferredRows = ["A", "B", "C"]; // Only cheapest rows
        preferredSeats = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // All seats in cheap rows
        scoringWeights = {
          rowPreference: 20, // Highest weight for cheapest rows
          positionPreference: 5,
          centerPreference: 2
        };
        break;
        
      default:
        // General preferences - middle rows, center seats
        preferredRows = ["E", "F", "D", "G"];
        preferredSeats = [6, 7, 8, 9];
        scoringWeights = {
          rowPreference: 10,
          positionPreference: 10,
          centerPreference: 5
        };
    }
    
    // Generate all possible adjacent seat combinations
    const allRecommendations = [];
    
    for (const row of preferredRows) {
      for (const startSeat of preferredSeats) {
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
          // Calculate score based on user type preferences
          let score = 0;
          
          // Row preference score
          score += (preferredRows.length - preferredRows.indexOf(row)) * scoringWeights.rowPreference;
          
          // Position preference score (corner vs center)
          if (userType === 'couple') {
            // Couples prefer corners - higher score for seats 1-4 and 11-14
            const isCorner = startSeat <= 4 || startSeat >= 11;
            score += isCorner ? scoringWeights.positionPreference : 0;
          } else {
            // Others prefer center
            const centerDistance = Math.abs(7.5 - (startSeat + seatCount/2));
            score += (4 - centerDistance) * scoringWeights.centerPreference;
          }
          
          // Elderly get bonus for lowest rows
          if (userType === 'elderly' && ['A', 'B', 'C'].includes(row)) {
            score += 20;
          }
          
          // Families get bonus for center area
          if (userType === 'family' && startSeat >= 5 && startSeat <= 10) {
            score += 15;
          }
          
          // Budget users get bonus for cheapest rows (A-C)
          if (userType === 'budget' && ['A', 'B', 'C'].includes(row)) {
            score += 25; // Highest bonus for cheapest rows
          }
          
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
