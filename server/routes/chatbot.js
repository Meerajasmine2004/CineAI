import express from "express";
import axios from "axios";

const router = express.Router();

// Session storage for conversation state
const sessions = {};

// POST /api/chatbot - Session-based conversational chatbot
router.post("/", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const msg = message.toLowerCase();

    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        step: "start",
        genre: null,
        time: null,
        tickets: null
      };
    }

    const session = sessions[sessionId];
    let responseText = "";
    let responseData = null;

    //----------------------------------
    // GREETING
    //----------------------------------
    if (msg.includes("hi") || msg.includes("hello")) {
      session.step = "genre";
      return res.json({
        success: true,
        message: "Hey! What kind of movie are you in the mood for?\n\n(Action, Comedy, Thriller, Romance, Horror, Sci-Fi, Drama)\n\nOr tell me how you're feeling (bored, sad, happy)!"
      });
    }

    //----------------------------------
    // MOOD-BASED (Dialogflow-like)
    //----------------------------------
    else if (msg.includes("bored")) {
      session.genre = "action";
      session.step = "time";
      return res.json({
        success: true,
        message: "Sounds like you need excitement! Let's go with an action movie!\n\nWhen would you like to watch?\n(morning / evening / tonight)"
      });
    }

    else if (msg.includes("sad")) {
      session.genre = "drama";
      session.step = "time";
      return res.json({
        success: true,
        message: "I understand Let's pick something emotional and meaningful.\n\nWhen would you like to watch?\n(morning / evening / tonight)"
      });
    }

    else if (msg.includes("happy")) {
      session.genre = "comedy";
      session.step = "time";
      return res.json({
        success: true,
        message: "Awesome! Let's go with a fun, uplifting movie!\n\nWhen would you like to watch?\n(morning / evening / tonight)"
      });
    }

    //----------------------------------
    // GENRE SELECTION
    //----------------------------------
    else if (session.step === "genre") {
      if (msg.includes("action") || msg.includes("thriller") || msg.includes("comedy") || 
          msg.includes("romance") || msg.includes("horror") || 
          msg.includes("sci-fi") || msg.includes("drama")) {
        
        session.genre = msg;
        session.step = "time";
        return res.json({
          success: true,
          message: `Nice! ${msg.charAt(0).toUpperCase() + msg.slice(1)} it is!\n\nWhen would you like to watch?\n(morning / evening / tonight)`
        });
      } else {
        return res.json({
          success: false,
          message: "Please choose a valid genre: Action, Comedy, Thriller, Romance, Horror, Sci-Fi, or Drama"
        });
      }
    }

    //----------------------------------
    // TIME SELECTION
    //----------------------------------
    else if (session.step === "time") {
      if (msg.includes("morning") || msg.includes("evening") || msg.includes("tonight")) {
        session.time = msg;
        session.step = "tickets";
        return res.json({
          success: true,
          message: `Perfect! ${msg.charAt(0).toUpperCase() + msg.slice(1)} show selected!\n\nHow many tickets do you need? (1-10)`
        });
      } else {
        return res.json({
          success: false,
          message: "Please choose a time: morning, evening, or tonight"
        });
      }
    }

    //----------------------------------
    // TICKETS + AI RECOMMENDATION
    //----------------------------------
    else if (session.step === "tickets") {
      const ticketCount = parseInt(msg);
      if (ticketCount >= 1 && ticketCount <= 10) {
        session.tickets = ticketCount;
        session.step = "done";
        
        try {
          // GET REAL MOVIES FROM DB
          const Movie = (await import("../models/Movie.js")).default;
          const moviesRaw = await Movie.find();

          const allMovies = moviesRaw.map(m => ({
            _id: m._id,
            title: m.title,
            genre: m.genre,
            language: m.language || "english"
          }));

          console.log("Sending to Flask:", allMovies);

          const axios = (await import("axios")).default;
          const response = await axios.post("http://localhost:5001/recommend", {
            userId: "demo-user",
            userGenres: [session.genre],
            userLanguages: ["english"],
            bookingHistory: [],
            allMovies: allMovies
          });

          const movie = response.data.recommendations?.[0];

          if (!movie) {
            return res.json({
              success: false,
              message: "No recommendations found"
            });
          }

          //----------------------------------
          // DYNAMIC SEATS (RANDOMIZED)
          //----------------------------------
          const seats = Array.from(
            { length: session.tickets },
            (_, i) => `D${Math.floor(Math.random() * 10) + i + 1}`
          );

          //----------------------------------
          // RANDOM THEATRE
          //----------------------------------
          const theatres = ["INOX Chennai", "PVR Velachery", "AGS Cinemas", "SPI Palazzo"];
          const theatre = theatres[Math.floor(Math.random() * theatres.length)];

          //----------------------------------
          // TIME MAPPING
          //----------------------------------
          const timeMap = {
            "morning": "10:00 AM",
            "evening": "6:00 PM", 
            "tonight": "9:00 PM"
          };

          // ADD BACKEND DEBUG LOG
          console.log("FINAL DATA SENT:", {
            movie: movie?.title,
            theatre,
            time: session.time,
            seats,
            total: session.tickets * 250
          });

          //----------------------------------
          // FINAL RESPONSE (ONLY ONCE)
          //----------------------------------
          return res.json({
            success: true,
            type: "booking_card",
            data: {
              movie: movie?.title || "Gladiator",
              theatre: theatre,
              time: timeMap?.[session.time] || session.time || "10:00 PM",
              seats: seats || ["D6","D7"],
              total: Number(session.tickets * 250) || 500
            }
          });

        } catch (error) {
          console.error("Error calling recommendation API:", error.response?.data || error.message);
          return res.json({
            success: false,
            message: "I'm having trouble getting recommendations. Please try again."
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Please enter a valid number between 1 and 10 tickets"
        });
      }
    }

    //----------------------------------
    // DEFAULT
    //----------------------------------
    else {
      return res.json({
        success: true,
        message: "Say 'hi' to start booking\n\nI can help you with:\nMovie recommendations based on your mood\nTicket bookings\nShowtime information\nPersonalized suggestions"
      });
    }

  } catch (error) {
    console.error("Chatbot error:", error);
    return res.json({
      success: false,
      message: "Something went wrong. Please try again"
    });
  }
});

// POST /api/chatbot/webhook - Dialogflow Webhook
router.post("/webhook", async (req, res) => {
  try {
    const intent = req.body.queryResult.intent.displayName;
    const params = req.body.queryResult.parameters;
    const session = req.body.session;

    console.log(`Dialogflow Intent: ${intent}`);
    console.log(`Parameters:`, params);

    let responseText = "";

    // Handle different intents
    switch (intent) {
      case "Greeting":
        responseText = "Hello! I'm CineAI Assistant. I can help you with movie recommendations, booking tickets, checking showtimes, and more. How can I assist you today?";
        break;

      case "ShowMovies":
        try {
          const Movie = (await import("../models/Movie.js")).default;
          const movies = await Movie.find().limit(10);
          
          if (movies.length > 0) {
            const movieList = movies.map(movie => `**${movie.title}** - ${movie.genre?.join(", ")}`).join("\n");
            responseText = `Here are our current movies:\n\n${movieList}\n\nWould you like to know more about any specific movie or book tickets?`;
          } else {
            responseText = "I'm sorry, but I couldn't find any movies at the moment. Please check back later.";
          }
        } catch (error) {
          console.error("Error fetching movies:", error);
          responseText = "I'm having trouble fetching movies right now. Please try again later.";
        }
        break;

      case "BookTickets":
        responseText = "I'd be happy to help you book tickets! Here's how:\n\n1. Browse our movies\n2. Select your preferred movie and showtime\n3. Choose your seats\n4. Complete payment\n\nWould you like to see our current movies or check showtimes for a specific movie?";
        break;

      case "Mood_Bored":
      case "Mood_Sad":
      case "Mood_Happy":
      case "MoodBasedRec":
        try {
          // Get user info (mock or from auth)
          const user = {
            _id: req.user?.id || "demo-user",
            preferences: {
              genres: ["action", "thriller"],
              languages: ["english"]
            }
          };

          // Fetch movies from DB
          const Movie = (await import("../models/Movie.js")).default;
          const allMoviesRaw = await Movie.find();

          // Clean movie data for Flask
          const allMovies = allMoviesRaw.map(movie => ({
            _id: movie._id,
            title: movie.title,
            genre: movie.genre,
            language: movie.language
          }));

          console.log("Sending to Flask:", allMovies);

          // Call Flask API
          const axios = (await import("axios")).default;
          const response = await axios.post(
            "http://localhost:5001/recommend",
            {
              userId: user._id,
              userGenres: user.preferences.genres,
              userLanguages: user.preferences.languages,
              bookingHistory: [], // Could be fetched from user's booking history
              allMovies: allMovies
            }
          );

          const movies = response.data.recommendations;

          // Format response
          let text = "Here are some movies you might love 🎬:\n\n";

          movies.slice(0, 3).forEach((m, i) => {
            text += `${i + 1}. **${m.title}**\n`;
            if (m.genre) {
              text += `   🎭 ${Array.isArray(m.genre) ? m.genre.join(", ") : m.genre}\n`;
            }
            if (m.rating) {
              text += `   ⭐ ${m.rating}/10\n`;
            }
            text += "\n";
          });

          text += "\nWould you like to know more about any of these movies or book tickets?";

          responseText = text;

        } catch (error) {
          console.error(
            "Error calling recommendation API:",
            error.response?.data || error.message
          );
          responseText = "I can help you find great movies! Let me show you our current popular movies instead.";
        }
        break;

      case "Provide_Tickets":
        try {
          // Extract user inputs
          const params = req.body.queryResult.parameters;
          const seatCount = params.number?.numberValue || 2;

          // Mock / fetch user preferences
          const user = {
            _id: req.user?.id || "demo-user",
            preferences: {
              genres: ["action"],
              languages: ["english"]
            }
          };

          // Fetch and clean movies
          const Movie = (await import("../models/Movie.js")).default;
          const allMoviesRaw = await Movie.find();
          
          // Clean movie data for Flask
          const allMovies = allMoviesRaw.map(movie => ({
            _id: movie._id,
            title: movie.title,
            genre: movie.genre,
            language: movie.language
          }));

          console.log("Provide_Tickets - Sending to Flask:", allMovies);

          const axios = (await import("axios")).default;

          // Get movies
          const moviesRes = await axios.post(
            "http://localhost:5001/recommend",
            {
              userId: user._id,
              userGenres: user.preferences.genres,
              userLanguages: user.preferences.languages,
              bookingHistory: [],
              allMovies: allMovies
            }
          );

          const movie = moviesRes.data.recommendations[0];

          // Seat recommendation
          const seatRes = await axios.post(
            "http://localhost:5001/seat-score",
            {
              seatGrid: [],
              bookedSeats: [],
              userType: "general",
              seatCount
            }
          );

          const seats = seatRes.data.bestSeats || ["D6", "D7"];

          // Build response like UI card
          const text = `
🎬 *Recommended Booking*

Movie: ${movie.title}
Theatre: INOX Chennai
Time: 10:00 PM
Seats: ${seats.join(", ")}
Total: ₹${seatCount * 250}

Click below to proceed with booking 🎟️
`;

          responseText = text;

        } catch (error) {
          console.error(
            "Error generating booking recommendation:",
            error.response?.data || error.message
          );
          responseText = "I'm having trouble creating your booking recommendation. Please try again or visit our booking page directly.";
        }
        break;

      default:
        responseText = "I'm here to help! You can ask me about:\n\n- Movie recommendations\n- Booking tickets\n- Showtimes\n- Seat selection\n- Payment options\n- Booking cancellations\n\nWhat would you like to know?";
        break;
    }

    // Return Dialogflow response
    res.json({
      fulfillmentText: responseText
    });

  } catch (error) {
    console.error("Dialogflow webhook error:", error);
    res.json({
      fulfillmentText: "I'm here to help! You can ask me about movie recommendations, booking tickets, showtimes, and more. How can I assist you?"
    });
  }
});

export default router;
