import {
  getRecommendations,
  getRecommendedTheatre,
  getRecommendedSeats
} from './recommendationService.js';

// In-memory conversation storage (in production, use Redis or database)
const conversationMemory = new Map();

class ChatbotService {
  constructor() {
    // Track last recommended movie to avoid repetition
    this.lastRecommendedMovie = null;
  }

  // Enhanced NLP-based Intent Detection
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Initialize response object with enhanced intent types
    const intent = {
      mainIntent: null,
      entities: {
        movieName: null,
        genre: null,
        time: null,
        seatCount: null,
        audienceType: null,
        mood: null
      },
      confidence: 0,
      originalMessage: message
    };
    
    // Enhanced Intent Detection with NLP patterns
    if (this.isGreeting(lowerMessage)) {
      intent.mainIntent = 'GREETING';
      intent.confidence = 0.9;
    } else if (this.isShowMoviesIntent(lowerMessage)) {
      intent.mainIntent = 'SHOW_AVAILABLE_MOVIES';
      intent.confidence = 0.8;
    } else if (this.isBookingIntent(lowerMessage) || this.containsGenre(lowerMessage)) {
      intent.mainIntent = 'BOOK_TICKETS';
      intent.confidence = 0.8;
      this.extractBookingEntities(lowerMessage, intent);
    } else if (this.isMovieSearchIntent(lowerMessage)) {
      intent.mainIntent = 'MOVIE_SEARCH';
      intent.confidence = 0.8;
      this.extractSearchEntities(lowerMessage, intent);
    } else if (this.isMoodBasedIntent(lowerMessage)) {
      intent.mainIntent = 'MOOD_BASED_RECOMMENDATION';
      intent.confidence = 0.8;
      this.extractMoodEntities(lowerMessage, intent);
    } else if (this.isChangeMovieIntent(lowerMessage)) {
      intent.mainIntent = 'CHANGE_MOVIE';
      intent.confidence = 0.7;
    } else if (this.isPaymentIntent(lowerMessage)) {
      intent.mainIntent = 'PAYMENT';
      intent.confidence = 0.9;
    } else if (this.isConfirmationIntent(lowerMessage)) {
      intent.mainIntent = 'CONFIRM_BOOKING';
      intent.confidence = 0.9;
    } else {
      intent.mainIntent = 'GENERAL_QUERY';
      intent.confidence = 0.3;
    }

    return intent;
  }

  isGreeting(message) {
    const greetings = [
      "hi",
      "hello",
      "hey",
      "heyy",
      "good morning",
      "good afternoon",
      "good evening",
      "greetings"
    ];

    return greetings.some(g => message.includes(g));
  }

  isBookingIntent(message) {
    const bookingKeywords = ['book', 'ticket', 'tickets', 'reserve', 'booking', 'buy', 'get', 'want to watch'];
    return bookingKeywords.some(keyword => message.includes(keyword));
  }

  containsGenre(message) {
    const genres = ['action', 'comedy', 'romance', 'drama', 'horror', 'thriller', 'sci-fi', 'animation', 'family', 'adventure'];
    return genres.some(genre => message.includes(genre));
  }

  isMovieSearchIntent(message) {
    const searchKeywords = ['movies', 'movie', 'show', 'playing', 'running', 'any good movies'];
    return searchKeywords.some(keyword => message.includes(keyword));
  }

  isShowMoviesIntent(message) {
    const showKeywords = [
      'what movies', 
      'movies available', 
      'show movies', 
      'what\'s playing', 
      'what\'s showing',
      'what is playing',
      'what movies',
      'movies'
    ];
    return showKeywords.some(keyword => message.includes(keyword));
  }

  isMoodBasedIntent(message) {
    const moodKeywords = ['feel', 'bored', 'sad', 'happy', 'stressed', 'tired', 'romantic', 'excited'];
    return moodKeywords.some(keyword => message.includes(keyword));
  }

  isChangeMovieIntent(message) {
    const changeKeywords = ['not same', 'another movie', 'different movie', 'change movie', 'something else'];
    return changeKeywords.some(keyword => message.includes(keyword));
  }

  isPaymentIntent(message) {
    const paymentKeywords = ['payment', 'pay', 'checkout', 'buy now', 'proceed to payment'];
    return paymentKeywords.some(keyword => message.includes(keyword));
  }

  isConfirmationIntent(message) {
    const confirmKeywords = ['confirm', 'book it', 'proceed', 'yes', 'okay', 'sounds good', 'that\'s perfect'];
    return confirmKeywords.some(keyword => message.includes(keyword));
  }

  // Enhanced Entity Extraction
  extractBookingEntities(message, intent) {
    // Extract seat count - simpler detection for any number
    const seatMatch = message.match(/\b(\d+)\b/);
    if (seatMatch) {
      intent.entities.seatCount = parseInt(seatMatch[1]);
    }

    // Extract genre
    const genres = ['action', 'comedy', 'romance', 'drama', 'horror', 'thriller', 'sci-fi', 'animation', 'family', 'adventure'];
    for (const genre of genres) {
      if (message.includes(genre)) {
        intent.entities.genre = genre;
        break;
      }
    }

    // Extract time
    const timeMap = {
      'morning': '10:00 AM',
      'afternoon': '1:00 PM',
      'evening': '7:00 PM',
      'night': '10:00 PM',
      'tonight': '10:00 PM',
      'today': '7:00 PM',
      'tomorrow': '7:00 PM'
    };

    for (const [keyword, time] of Object.entries(timeMap)) {
      if (message.includes(keyword)) {
        intent.entities.time = time;
        break;
      }
    }

    // Extract movie name dynamically from database
    // Note: This is now handled in the main processChatbotRequest where we have userId
    // We'll set a flag here to indicate movie detection is needed
    intent.entities.movieDetectionNeeded = true;

    // Extract audience type
    if (message.includes('parents') || message.includes('elderly') || message.includes('old')) {
      intent.entities.audienceType = 'elderly';
    } else if (message.includes('couple') || message.includes('date') || message.includes('romantic')) {
      intent.entities.audienceType = 'couple';
    } else if (message.includes('family') || message.includes('kids') || message.includes('children')) {
      intent.entities.audienceType = 'family';
    } else if (message.includes('friends') || message.includes('group')) {
      intent.entities.audienceType = 'friends';
    }
  }

  extractSearchEntities(message, intent) {
    // Similar to booking entities but focused on search
    this.extractBookingEntities(message, intent);
  }

  extractMoodEntities(message, intent) {
    const moodMap = {
      'sad': 'sad',
      'bored': 'bored',
      'happy': 'happy',
      'stressed': 'stressed',
      'tired': 'tired',
      'romantic': 'romantic',
      'excited': 'happy'
    };

    for (const [keyword, mood] of Object.entries(moodMap)) {
      if (message.includes(keyword)) {
        intent.entities.mood = mood;
        break;
      }
    }
  }

  // Dynamic movie detection from database
  async detectMovieFromMessage(message, userId = null) {
    try {
      // Get all movies from database
      const movies = await getRecommendations(userId);
      
      // If no movies from database, use fallback movies
      const allMovies = movies && movies.length > 0 ? movies : this.getFallbackMovies(null);
      
      // Check if message contains any movie title (case insensitive)
      const lowerMessage = message.toLowerCase();
      
      for (const movie of allMovies) {
        if (movie.title && lowerMessage.includes(movie.title.toLowerCase())) {
          console.log(`🎬 Detected movie from database: ${movie.title}`);
          return movie.title;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error detecting movie from database:', error);
      return null;
    }
  }

  // Helper function to get random movie from filtered results
  getRandomMovie(movies, excludeMovieId = null) {
    if (!movies || movies.length === 0) return null;
    
    let availableMovies = movies;
    
    // Exclude last recommended movie if provided
    if (excludeMovieId) {
      availableMovies = movies.filter(movie => movie._id.toString() !== excludeMovieId.toString());
    }
    
    if (availableMovies.length === 0) return null;
    
    return availableMovies[Math.floor(Math.random() * availableMovies.length)];
  }

  // Helper function to get mood-based movie suggestions
  getMoodBasedGenre(mood) {
    const moodGenreMap = {
      sad: ['comedy', 'feel-good', 'drama'],
      happy: ['adventure', 'comedy', 'action'],
      bored: ['action', 'thriller', 'mystery'],
      romantic: ['romance', 'drama'],
      stressed: ['comedy', 'family', 'animation'],
      tired: ['drama', 'romance', 'comedy']
    };
    
    return moodGenreMap[mood] || ['comedy', 'action'];
  }

  // Helper function to get dynamic responses
  getDynamicResponse(context, movie, emotion = null) {
    const responses = {
      romantic: [
        `I found the perfect romantic movie for you ❤️`,
        `Here's a beautiful love story for your evening! 💕`,
        `This romantic movie looks perfect for tonight! 🌹`
      ],
      action: [
        `Get ready for non-stop action! 🚀`,
        `This action movie will keep you on the edge! 🔥`,
        `Here's an action-packed adventure for you! 💪`
      ],
      comedy: [
        `Get ready to laugh! 😄`,
        `This comedy will brighten your day! 🌟`,
        `Here's a feel-good movie for you! 😊`
      ],
      horror: [
        `Brace yourself for thrills! 😱`,
        `This horror movie is perfect for tonight! 🌙`,
        `Get ready for some scares! 👻`
      ],
      default: [
        `Here's another movie you might enjoy 🎬`,
        `How about this option? 🤔`,
        `This one looks perfect for tonight! ✨`,
        `I think you'll like this one! 😊`
      ]
    };

    const category = movie.genre ? movie.genre[0]?.toLowerCase() : 'default';
    const categoryResponses = responses[category] || responses.default;
    
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  }

  // Handle "not the same" requests
  async handleNotTheSameRequest(conversation, userId = null) {
    try {
      console.log('🎯 "Not the same" request received. Last recommended movie:', this.lastRecommendedMovie);
      
      // Get all available movies from database first
      let movies = [];
      try {
        movies = await getRecommendations(userId);
        console.log('📊 Retrieved movies from database:', movies.length);
      } catch (error) {
        console.log('⚠️ Could not get movies from database, using fallback');
      }

      // If no movies from database, use fallback
      if (!movies || movies.length === 0) {
        movies = this.getFallbackMovies(conversation.genre);
        console.log('🆘 Using fallback movies for "not the same" request');
      }

      // Exclude last recommended movie when selecting the next movie
      const movie = this.getRandomMovie(movies, this.lastRecommendedMovie);
      
      if (!movie) {
        return {
          success: false,
          message: "I couldn't find another movie right now. Please try again! 🎬",
          data: null
        };
      }

      // Get recommended theatre
      const theatre = await getRecommendedTheatre(movie._id);
      
      if (!theatre || !theatre.theatre) {
        console.log('🏢 No theatre found, using fallback');
        const fallbackTheatre = this.getFallbackTheatre();
        theatre.theatre = fallbackTheatre;
      }

      console.log('🏢 Selected theatre:', theatre.theatre);

      // Get recommended seats
      const seats = await getRecommendedSeats(
        movie._id, 
        theatre.theatre, 
        conversation.showtime || '7:00 PM', 
        conversation.seatCount || 2, 
        conversation.userType
      );
      
      if (!seats || seats.length === 0) {
        console.log('🪑 No seats found, using fallback');
        const fallbackSeats = this.getFallbackSeats(conversation.seatCount || 2);
        
        return {
          success: true,
          message: this.generateContextualResponse(movie, conversation),
          data: {
            movie: {
              id: movie._id,
              title: movie.title,
              genre: movie.genre,
              poster: movie.poster
            },
            theatre: theatre.theatre,
            showTime: conversation.showtime || '7:00 PM',
            seats: fallbackSeats,
            totalPrice: this.calculatePrice(fallbackSeats),
            intent: conversation
          }
        };
      }

      console.log('🪑 Selected seats:', seats);

      // Calculate price
      const totalPrice = this.calculatePrice(seats);
      console.log('💰 Total price:', totalPrice);

      // Generate contextual response based on genre
      let contextualMessage = this.generateContextualResponse(movie, conversation);

      return {
        success: true,
        message: contextualMessage,
        data: {
          movie: {
            id: movie._id,
            title: movie.title,
            genre: movie.genre,
            poster: movie.poster
          },
          theatre: theatre.theatre,
          showTime: conversation.showtime || '7:00 PM',
          seats: seats,
          totalPrice: totalPrice,
          intent: conversation
        }
      };
    } catch (error) {
      console.error('❌ Error in handleNotTheSameRequest:', error);
      return {
        success: false,
        message: "I'm sorry, I encountered an issue finding a different movie. Please try again! 🎬",
        data: null
      };
    }
  }

  generateContextualResponse(movie, conversation) {
    const genre = movie.genre ? movie.genre[0]?.toLowerCase() : 'default';
    
    const contextualMessages = {
      action: "🚀 Get ready for some action! Here's your movie:\n\n",
      romance: "❤️ Perfect romantic choice! Here's your movie:\n\n",
      comedy: "😄 This one will make you laugh! Here's your movie:\n\n",
      horror: "😱 Scary movie time! Here's your selection:\n\n",
      thriller: "🔍 Edge of your seat thriller! Here's your movie:\n\n",
      drama: "🎭 Dramatic masterpiece awaits! Here's your movie:\n\n",
      family: "👨‍👩‍👧‍👦 Perfect family entertainment! Here's your movie:\n\n",
      sci_fi: "🚀 Sci-fi adventure awaits! Here's your movie:\n\n",
      default: "🎬 Great movie choice! Here's your selection:\n\n"
    };

    let response = contextualMessages[genre] || contextualMessages.default;
    
    response += `🎬 **Movie**: ${movie.title}\n`;
    if (movie.genre) {
      response += `🎭 **Genre**: ${movie.genre.join(', ')}\n`;
    }
    
    // Add booking details
    const theatre = this.getFallbackTheatre();
    const showTime = conversation.showtime || '7:00 PM';
    const seats = this.getFallbackSeats(conversation.seatCount || 2);
    const totalPrice = this.calculatePrice(seats);
    
    response += `🏢 **Theatre**: ${theatre}\n`;
    response += `⏰ **Time**: ${showTime}\n`;
    response += `🪑 **Seats**: ${seats.join(', ')}\n`;
    response += `💰 **Total**: ₹${totalPrice.toLocaleString('en-IN')}\n\n`;
    
    response += "Enjoy your movie experience! �";
    
    return response;
  }

  async processChatbotRequest(userId, message, sessionId = null) {
    try {
      // Detect user intent
      const intent = this.detectIntent(message);
      
      console.log('Detected Intent:', intent);

      // Handle genre immediately if detected
      if (intent.entities.genre && sessionId) {
        const conversation = this.getConversation(sessionId);
        if (!conversation.genre) {
          conversation.genre = intent.entities.genre;
          conversationMemory.set(sessionId, conversation);
          console.log(`🎭 Genre immediately set to: ${conversation.genre}`);
        }
      }

      // Handle time immediately if detected
      if (intent.entities.time && sessionId) {
        const conversation = this.getConversation(sessionId);
        if (!conversation.showtime || intent.entities.time !== conversation.showtime) {
          conversation.showtime = intent.entities.time;
          conversationMemory.set(sessionId, conversation);
          console.log(`⏰ Time immediately set to: ${conversation.showtime}`);
        }
      }

      // Handle dynamic movie detection if needed
      if (intent.entities.movieDetectionNeeded) {
        const detectedMovie = await this.detectMovieFromMessage(message, userId);
        if (detectedMovie) {
          intent.entities.movieName = detectedMovie;
          console.log(`🎬 Dynamic movie detection found: ${detectedMovie}`);
        }
        // Remove the flag after processing
        delete intent.entities.movieDetectionNeeded;
      }

      // Handle special requests for different movies
      if (message.toLowerCase().includes('not the same') || message.toLowerCase().includes('another movie') || 
          message.toLowerCase().includes('another') || message.toLowerCase().includes('next')) {
        const conversation = this.getConversation(sessionId);
        return await this.handleNotTheSameRequest(conversation, userId);
      }

      // Handle emotional responses first
      if (intent.entities.mood) {
        intent.emotion = intent.entities.mood;
        
        // Update conversation with emotion
        if (sessionId) {
          const conversation = this.getConversation(sessionId);
          conversation.emotion = intent.emotion;
          
          // Auto-set genre based on mood if not already set
          if (!conversation.genre) {
            const moodGenre = this.getMoodBasedGenre(conversation.emotion);
            if (moodGenre && moodGenre.length > 0) {
              conversation.genre = moodGenre[0];
            }
          }
          
          conversationMemory.set(sessionId, conversation);
        }
        
        return this.handleEmotionalResponse(intent);
      }

      // Handle greeting responses
      if (intent.mainIntent === 'GREETING') {
        const conversation = this.getConversation(sessionId);
        
        // Only ask for missing info if conversation has no progress
        if (
          conversation.genre ||
          conversation.seatCount ||
          conversation.showtime
        ) {
          return this.askForMissingInfo(conversation);
        }
        
        return this.handleGreeting();
      }

      // Handle movie discovery requests
      if (intent.mainIntent === 'SHOW_AVAILABLE_MOVIES') {
        return await this.processMovieDiscoveryRequest(userId);
      }

      // Handle conversational memory - Update BEFORE checking
      if (sessionId) {
        const conversation = this.getConversation(sessionId);
        this.updateConversation(sessionId, intent);
        
        // Prioritize movie name from user
        if (intent.entities.movieName) {
          conversation.genre = null;
          conversation.movieName = intent.entities.movieName;
        }
        
        // Check if we have enough information for booking
        if (this.canMakeBooking(conversation)) {
          return await this.makeBooking(userId, conversation);
        } else {
          return this.askForMissingInfo(conversation);
        }
      }

      // Handle direct intents without session
      if (intent.budget) {
        return await this.processBudgetRequest(userId, intent);
      }

      if (intent.surprise) {
        return await this.processSurpriseRequest(userId, intent);
      }

      // Handle direct booking with all info
      if (this.hasCompleteInfo(intent)) {
        return await this.makeBooking(userId, intent);
      }

      // Handle movie discovery requests
      if (intent.mainIntent === 'movie_discovery') {
        return await this.processMovieDiscoveryRequest(userId);
      }

      // Start conversation or ask for missing info
      return this.askForMissingInfo(intent);

    } catch (error) {
      console.error('Chatbot Error:', error);
      return {
        success: false,
        message: "Oops! Something went wrong. Please try again later! 🤖",
        data: null
      };
    }
  }

  // Handle movie discovery requests
  async processMovieDiscoveryRequest(userId) {
    try {
      console.log('🎬 Processing movie discovery request');
      
      // Get all available movies
      let movies = await getRecommendations(userId);
      console.log('📊 Available movies for discovery:', movies.length);
      
      if (!movies || movies.length === 0) {
        movies = this.getFallbackMovies(null);
        console.log('🆘 Using fallback movies for discovery');
      }

      // Return list of movies
      const movieList = movies.slice(0, 5).map((movie, index) => {
        return `${index + 1}. **${movie.title}**\n   🎭 **Genre**: ${movie.genre?.join(', ') || 'N/A'}\n   📅 **Duration**: ${movie.duration || 'N/A'} minutes\n   ⭐ **Rating**: ${movie.rating || 'N/A'}/5\n`;
      }).join('\n');

      return {
        success: true,
        message: `Here are the movies currently showing 🎬\n\n${movieList}\nWhich one interests you?`,
        data: {
          availableMovies: movies.slice(0, 5),
          totalCount: movies.length
        }
      };

    } catch (error) {
      console.error('❌ Movie Discovery Error:', error);
      return {
        success: false,
        message: "Sorry, I'm having trouble finding movies right now. Please try again later! 🎬",
        data: null
      };
    }
  }

  handleEmotionalResponse(intent) {
    const emotionResponses = {
      bored: {
        message: "Sounds like you need some excitement! 🍿\n\nHow about an action or thriller movie tonight? I can find something that'll definitely lift your mood!",
        suggestedGenre: this.getMoodBasedGenre('bored')
      },
      sad: {
        message: "I'm sorry you're feeling down. A great movie might help cheer you up 🎬\n\nWould you like something uplifting and heartwarming, or maybe an engaging story to take your mind off things?",
        suggestedGenre: this.getMoodBasedGenre('sad')
      },
      tired: {
        message: "Sometimes a relaxing movie is just what you need! 😌\n\nHow about a gentle drama or comedy that won't be too intense?",
        suggestedGenre: this.getMoodBasedGenre('tired')
      },
      happy: {
        message: "That's wonderful! Let's make your good mood even better with an amazing movie! 🎉\n\nWhat kind of movie would complement your great mood?",
        suggestedGenre: this.getMoodBasedGenre('happy')
      },
      stressed: {
        message: "I understand you're feeling stressed. A good movie can be a great escape! 🌟\n\nWould you prefer something light and funny, or an engaging story to help you unwind?",
        suggestedGenre: this.getMoodBasedGenre('stressed')
      },
      romantic: {
        message: "How romantic! I'd love to help you find the perfect movie for your special occasion ❤️\n\nLet me find something beautiful for your romantic evening!",
        suggestedGenre: this.getMoodBasedGenre('romantic')
      }
    };

    const response = emotionResponses[intent.emotion] || emotionResponses.bored;
    
    return {
      success: true,
      message: response.message,
      data: null,
      emotion: intent.emotion,
      suggestedGenre: response.suggestedGenre
    };
  }

  getConversation(sessionId) {
    if (!conversationMemory.has(sessionId)) {
      conversationMemory.set(sessionId, {
        genre: null,
        seatCount: null,
        showtime: null,
        userType: null,
        bookingDate: null,
        mainIntent: 'booking',
        messages: []
      });
    }
    return conversationMemory.get(sessionId);
  }

  updateConversation(sessionId, intent) {
    const conversation = this.getConversation(sessionId);
    
    // Update conversation with new information from intent.entities
    if (intent.entities.genre && !conversation.genre)
      conversation.genre = intent.entities.genre;
    
    if (intent.entities.seatCount && !conversation.seatCount)
      conversation.seatCount = intent.entities.seatCount;
    
    if (intent.entities.time && !conversation.showtime)
      conversation.showtime = intent.entities.time;
    
    if (intent.entities.audienceType && !conversation.userType)
      conversation.userType = intent.entities.audienceType;
    
    if (intent.entities.bookingDate && !conversation.bookingDate)
      conversation.bookingDate = intent.entities.bookingDate;
    
    if (intent.mainIntent && !conversation.mainIntent)
      conversation.mainIntent = intent.mainIntent;
    
    // Add message to history
    conversation.messages.push({
      message: intent.originalMessage,
      timestamp: new Date(),
      intent: intent
    });
    
    conversationMemory.set(sessionId, conversation);
  }

  handleGreeting() {
    const greetings = [
      "Hello! 🎬 Welcome to CineAI Assistant!",
      "Hi there! I'm your movie booking expert. How can I help you today? 🍿",
      "Hey! Ready to find you the perfect movie experience! 🎭",
      "Good to see you! What movie adventure are we planning today? 🎬",
      "Greetings! I'm here to help with all your movie booking needs! 🎟"
    ];
    
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return {
      success: true,
      message: randomGreeting,
      data: null
    };
  }

  canMakeBooking(conversation) {
    return conversation.genre && conversation.showtime && conversation.seatCount;
  }

  hasCompleteInfo(intent) {
    return intent.genre && intent.showtime && intent.seatCount;
  }

  askForMissingInfo(conversation) {
    const missing = [];
    
    if (!conversation.genre)
      missing.push("genre");
    
    if (!conversation.showtime)
      missing.push("time");
    
    if (!conversation.seatCount)
      missing.push("seatCount");

    // Conversational and varied responses
    const conversationalResponses = {
      genre_missing: [
        "What genre of movie are you in the mood for? 🎬\n\nAction, romance, comedy, horror, thriller, family, sci-fi?",
        "I'd love to help you find the perfect movie! What genre interests you most? 🍿",
        "Great! What kind of movie experience are you looking for? �\n\nDrama, comedy, action, romance...?"
      ],
      time_missing: [
        "When would you like to watch the movie? ⏰\n\nMorning, afternoon, evening, or tonight?",
        "Perfect! What time works best for you? 🕐\n\nMorning (10 AM), afternoon (2 PM), evening (7 PM), or tonight (10 PM)?",
        "Great choice! When are you planning to watch? 🎬\n\nToday or tomorrow? Morning, afternoon, or evening?"
      ],
      seat_missing: [
        "How many seats do you need? 🪑\n\nJust for yourself, or for a group?",
        "How many people will be watching? 👥\n\nI'll find the best seats for your group!",
        "How many tickets should I book? 🎟️\n\nLet me know how many seats you need!"
      ],
      multiple_missing: [
        "I'd be happy to help you book movie tickets! 🎬\n\nTo find the perfect movie for you, I'll need to know:\n• What genre you'd like\n• When you want to watch\n• How many seats you need",
        "Let me help you find the perfect movie experience! 🍿\n\nI just need a few details:\n• Your preferred movie genre\n• Your preferred showtime\n• Number of seats needed",
        "Great! I'm here to help you book the perfect movie night! 🎭\n\nTell me:\n• What genre interests you\n• When you'd like to watch\n• How many seats you need"
      ]
    };

    let message = "";
    
    if (missing.length === 0) {
      message = "Perfect! I have all the information I need. Let me find the best options for you... 🎬";
    } else if (missing.length === 1) {
      if (missing.includes('genre')) {
        const responses = conversationalResponses.genre_missing;
        message = responses[Math.floor(Math.random() * responses.length)];
      } else if (missing.includes('time')) {
        const responses = conversationalResponses.time_missing;
        message = responses[Math.floor(Math.random() * responses.length)];
      } else if (missing.includes('seatCount')) {
        const responses = conversationalResponses.seat_missing;
        message = responses[Math.floor(Math.random() * responses.length)];
      }
    } else {
      const responses = conversationalResponses.multiple_missing;
      message = responses[Math.floor(Math.random() * responses.length)];
    }

    return {
      success: true,
      message,
      data: null,
      needsMoreInfo: missing.length > 0,
      missingInfo: missing
    };
  }

  async makeBooking(userId, conversation) {
    try {
      console.log('🎬 Making booking with conversation:', conversation);

      // Prioritize movie name from user
      if (conversation.movieName) {
        const allRecommendations = await getRecommendations(userId);
        console.log('📊 Searching for specific movie:', conversation.movieName);
        
        const movie = allRecommendations.find(m => 
          m.title && m.title.toLowerCase() === conversation.movieName.toLowerCase()
        );
        
        if (movie) {
          console.log('🎯 Found specific movie:', movie.title);
          return await this.completeBooking(movie, userId, conversation);
        } else {
          console.log('⚠️ Movie not found, falling back to recommendations');
        }
      }

      // Get movie recommendations based on genre or mood
      let movies;
      let targetGenre = conversation.genre;
      
      // If emotion is detected, use mood-based genre
      if (conversation.emotion) {
        targetGenre = this.getMoodBasedGenre(conversation.emotion);
      }
      
      if (targetGenre) {
        const allRecommendations = await getRecommendations(userId);
        console.log('📊 All recommendations:', allRecommendations.length);
        
        movies = allRecommendations.filter(movie => 
          movie.genre && movie.genre.some(g => 
            g.toLowerCase().includes(targetGenre.toLowerCase())
          )
        );
        
        console.log(`🎯 Filtered ${movies.length} movies for genre "${targetGenre}"`);
        
        // If no movies found for genre, fallback to general recommendations
        if (movies.length === 0) {
          movies = allRecommendations;
          console.log(`🔄 No movies found for genre "${targetGenre}", using general recommendations`);
        }
      } else {
        movies = await getRecommendations(userId);
        console.log('📊 General recommendations:', movies.length);
      }
      
      // If still no movies, use fallback
      if (movies.length === 0) {
        movies = this.getFallbackMovies(targetGenre);
        console.log('🆘 Using fallback movies');
      }

      // Better movie rotation - avoid repeating the same movie
      const filteredMovies = movies.filter(m => 
        m._id && m._id.toString() !== this.lastRecommendedMovie?.toString()
      );
      
      const pool = filteredMovies.length > 0 ? filteredMovies : movies;
      const movie = pool[Math.floor(Math.random() * pool.length)];
      
      this.lastRecommendedMovie = movie._id;
      console.log('🎬 Selected movie:', movie.title);

      return await this.completeBooking(movie, userId, conversation);
    } catch (error) {
      console.error('❌ Error in makeBooking:', error);
      return {
        success: false,
        message: "I'm having trouble finding movies right now. Please try again in a moment! 🎬",
        data: null
      };
    }
  }

  async completeBooking(movie, userId, conversation) {
      try {

      // Get recommended theatre
      const theatre = await getRecommendedTheatre(movie._id);
      
      if (!theatre || !theatre.theatre) {
        console.log('🏢 No theatre found, using fallback');
        const fallbackTheatre = this.getFallbackTheatre();
        theatre.theatre = fallbackTheatre;
      }

      console.log('🏢 Selected theatre:', theatre.theatre);

      // Get recommended seats
      const seats = await getRecommendedSeats(
        movie._id, 
        theatre.theatre, 
        conversation.showtime || '7:00 PM', 
        conversation.seatCount || 2, 
        conversation.userType
      );
      
      if (!seats || seats.length === 0) {
        console.log('🪑 No seats found, using fallback');
        const fallbackSeats = this.getFallbackSeats(conversation.seatCount || 2);
        
        return {
          success: true,
          message: this.generateFallbackBookingResponse(conversation, movie, theatre.theatre, conversation.showtime || '7:00 PM', fallbackSeats),
          data: {
            movie: {
              id: movie._id,
              title: movie.title,
              genre: movie.genre,
              poster: movie.poster
            },
            theatre: theatre.theatre,
            showTime: conversation.showtime || '7:00 PM',
            seats: fallbackSeats,
            totalPrice: this.calculatePrice(fallbackSeats),
            intent: conversation
          }
        };
      }

      console.log('🪑 Selected seats:', seats);

      // Calculate total price
      const totalPrice = this.calculatePrice(seats);

      // Generate dynamic response based on context
      const response = this.getDynamicResponse(conversation, movie, conversation.emotion);

      return {
        success: true,
        message: response,
        data: {
          movie: {
            id: movie._id,
            title: movie.title,
            genre: movie.genre,
            poster: movie.poster
          },
          theatre: theatre.theatre,
          showTime: conversation.showtime || '7:00 PM',
          seats,
          totalPrice,
          intent: conversation
        }
      };

    } catch (error) {
      console.error('❌ Booking Error:', error);
      return {
        success: false,
        message: "Oops! Something went wrong while making your booking. Please try again! 🤖",
        data: null
      };
    }
  }

  getFallbackMovies(genre) {
    const fallbackMovies = [
      {
        _id: 'fallback_1',
        title: 'Love Again',
        genre: ['romance', 'drama'],
        poster: 'https://example.com/love-again.jpg',
        description: 'A romantic story about second chances at love.'
      },
      {
        _id: 'fallback_2', 
        title: 'Fast & Furious 10',
        genre: ['action', 'thriller'],
        poster: 'https://example.com/fast-furious.jpg',
        description: 'High-octane action and family loyalty.'
      },
      {
        _id: 'fallback_3',
        title: 'The Super Mario Bros. Movie',
        genre: ['family', 'comedy', 'animation'],
        poster: 'https://example.com/mario.jpg',
        description: 'Animated adventure for the whole family.'
      },
      {
        _id: 'fallback_4',
        title: 'Evil Dead Rise',
        genre: ['horror', 'thriller'],
        poster: 'https://example.com/evil-dead.jpg',
        description: 'Terrifying horror experience.'
      },
      {
        _id: 'fallback_5',
        title: 'Guardians of the Galaxy Vol. 3',
        genre: ['action', 'sci-fi', 'comedy'],
        poster: 'https://example.com/guardians.jpg',
        description: 'Epic space adventure with humor.'
      }
    ];

    if (genre) {
      const genreMovies = fallbackMovies.filter(movie => 
        movie.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
      );
      return genreMovies.length > 0 ? genreMovies : fallbackMovies;
    }

    return fallbackMovies;
  }

  getFallbackTheatre() {
    const theatres = ['PVR Phoenix', 'INOX Chennai', 'AGS Villivakkam', 'Sathyam Cinemas'];
    return theatres[Math.floor(Math.random() * theatres.length)];
  }

  getFallbackSeats(seatCount) {
    const seatRows = ['E', 'F', 'D', 'G'];
    const selectedRow = seatRows[Math.floor(Math.random() * seatRows.length)];
    const seats = [];
    
    for (let i = 1; i <= seatCount; i++) {
      seats.push(`${selectedRow}${i + 5}`);
    }
    
    return seats;
  }

  calculatePrice(seats) {
    let totalPrice = 0;
    seats.forEach(seat => {
      const row = seat.charAt(0);
      if (['A', 'B', 'C'].includes(row)) {
        totalPrice += 200;
      } else if (['D', 'E', 'F'].includes(row)) {
        totalPrice += 250;
      } else {
        totalPrice += 350;
      }
    });
    return totalPrice;
  }

  generateFallbackBookingResponse(conversation, movie, theatre, showTime, seats) {
    let response = "";
    
    if (conversation.genre && !movie.genre.some(g => g.toLowerCase().includes(conversation.genre.toLowerCase()))) {
      response = `I couldn't find an exact ${conversation.genre} movie, but this is a great option you might enjoy 🎬\n\n`;
    } else {
      response = "I found a great movie for you! 🎬\n\n";
    }

    response += `🎬 **Movie**: ${movie.title}\n`;
    if (movie.genre && movie.genre.length > 0) {
      response += `🎭 **Genre**: ${movie.genre.join(', ')}\n`;
    }
    
    response += `🏢 **Theatre**: ${theatre}\n`;
    response += `⏰ **Time**: ${showTime}\n`;
    response += `🪑 **Seats**: ${seats.join(', ')}\n`;
    response += `💰 **Total Price**: ₹${this.calculatePrice(seats).toLocaleString('en-IN')}\n\n`;
    
    response += "Enjoy your movie experience! ✨";

    return response;
  }

  generateBookingResponse(conversation, movie, theatre, showTime, seats, totalPrice) {
    let response = "";
    
    // Personalized greeting based on user type
    if (conversation.userType === 'couple') {
      response = "I found the perfect romantic option for you ❤️\n\n";
    } else if (conversation.userType === 'family') {
      response = "Great choice for family entertainment! 👨‍👩‍👧‍👦\n\n";
    } else if (conversation.userType === 'elderly') {
      response = "I found a comfortable option for you 🌟\n\n";
    } else {
      response = "I found a great option for you 🎬\n\n";
    }

    response += `🎬 **Movie**: ${movie.title}\n`;
    if (movie.genre) {
      response += `🎭 **Genre**: ${movie.genre}\n`;
    }
    
    response += `🏢 **Theatre**: ${theatre}\n`;
    response += `⏰ **Time**: ${showTime}\n`;
    response += `🪑 **Seats**: ${seats.join(', ')}\n`;
    response += `💰 **Total Price**: ₹${totalPrice.toLocaleString('en-IN')}\n\n`;
    
    // Personalized closing
    if (conversation.userType === 'couple') {
      response += "Enjoy your romantic movie night! 💑";
    } else if (conversation.userType === 'family') {
      response += "Have a wonderful family time! 🍿";
    } else if (conversation.userType === 'elderly') {
      response += "Enjoy the show in comfort! 🎭";
    } else {
      response += "Enjoy your movie experience! ✨";
    }

    return response;
  }

  async processBudgetRequest(userId, intent) {
    try {
      console.log('💰 Processing budget request:', intent);
      
      // Get all available movies
      let movies = await getRecommendations(userId);
      console.log('📊 Available movies for budget:', movies.length);
      
      if (!movies || movies.length === 0) {
        movies = this.getFallbackMovies(null);
        console.log('🆘 Using fallback movies for budget request');
      }

      // Define showtimes to check (prioritize earlier shows for budget)
      const showtimes = ['10:00 AM', '2:00 PM', '7:00 PM', '10:00 PM'];
      const targetShowtime = intent.showtime || showtimes[0];

      // Define theatres to check
      const theatres = ['PVR Phoenix', 'AGS Villivakkam', 'INOX Chennai', 'Sathyam Cinemas'];

      // Find cheapest option
      let cheapestOption = null;
      let lowestPrice = Infinity;

      for (const movie of movies) {
        for (const theatre of theatres) {
          // Check available seats for Normal (cheapest) category
          const normalSeats = await this.getNormalSeats(movie._id, theatre, targetShowtime, intent.seatCount || 2);
          
          if (normalSeats && normalSeats.length > 0) {
            const totalPrice = 200 * (intent.seatCount || 2); // Normal seats are ₹200 each
            
            if (totalPrice < lowestPrice) {
              lowestPrice = totalPrice;
              cheapestOption = {
                movie,
                theatre,
                showTime: targetShowtime,
                seats: normalSeats,
                totalPrice
              };
            }
          }
        }
      }

      // If no seats found, use fallback
      if (!cheapestOption) {
        console.log('🆘 No budget options found, using fallback');
        cheapestOption = {
          movie: movies[0],
          theatre: this.getFallbackTheatre(),
          showTime: targetShowtime,
          seats: this.getFallbackSeats(intent.seatCount || 2),
          totalPrice: 200 * (intent.seatCount || 2)
        };
      }

      // Generate budget-friendly response
      const response = this.generateBudgetResponse(cheapestOption, intent);

      return {
        success: true,
        message: response,
        data: {
          movie: {
            id: cheapestOption.movie._id,
            title: cheapestOption.movie.title,
            genre: cheapestOption.movie.genre,
            poster: cheapestOption.movie.poster
          },
          theatre: cheapestOption.theatre,
          showTime: cheapestOption.showTime,
          seats: cheapestOption.seats,
          totalPrice: cheapestOption.totalPrice,
          intent: { ...intent, budget: true }
        }
      };

    } catch (error) {
      console.error('❌ Budget Request Error:', error);
      return {
        success: false,
        message: "Oops! Something went wrong while finding budget options. Please try again! 🤖",
        data: null
      };
    }
  }

  async processSurpriseRequest(userId, intent) {
    try {
      console.log('🎪 Processing surprise request:', intent);
      
      // Get all available movies
      let movies = await getRecommendations(userId);
      console.log('📊 Available movies for surprise:', movies.length);
      
      if (!movies || movies.length === 0) {
        movies = this.getFallbackMovies(null);
        console.log('🆘 Using fallback movies for surprise request');
      }

      // Choose a popular or highly rated movie (first movie for now, can be enhanced with ratings)
      const selectedMovie = movies[0]; // In real implementation, this would be based on ratings/popularity
      
      console.log('🎬 Selected surprise movie:', selectedMovie.title);
      
      // Get the best recommended theatre for this movie
      const theatre = await getRecommendedTheatre(selectedMovie._id);
      
      let selectedTheatre = theatre?.theatre;
      if (!selectedTheatre) {
        selectedTheatre = this.getFallbackTheatre();
        console.log('🏢 Using fallback theatre for surprise');
      }

      console.log('🏢 Selected surprise theatre:', selectedTheatre);

      // Determine showtime based on message
      let showTime = '7:00 PM'; // default
      
      const lowerMessage = intent.originalMessage?.toLowerCase() || '';
      
      if (lowerMessage.includes('tonight') || lowerMessage.includes('night')) {
        showTime = '10:00 PM';
      } else if (lowerMessage.includes('evening')) {
        showTime = '7:00 PM';
      } else if (lowerMessage.includes('morning')) {
        showTime = '10:00 AM';
      } else if (lowerMessage.includes('afternoon')) {
        showTime = '2:00 PM';
      }

      // Get best AI seats
      const seats = await getRecommendedSeats(selectedMovie._id, selectedTheatre, showTime, intent.seatCount || 2);
      
      let selectedSeats = seats;
      if (!selectedSeats || selectedSeats.length === 0) {
        selectedSeats = this.getFallbackSeats(intent.seatCount || 2);
        console.log('🪑 Using fallback seats for surprise');
      }

      console.log('🪑 Selected surprise seats:', selectedSeats);

      // Calculate total price
      const totalPrice = this.calculatePrice(selectedSeats);

      // Generate surprise response
      const response = this.generateSurpriseResponse(selectedMovie, selectedTheatre, showTime, selectedSeats, totalPrice);

      return {
        success: true,
        message: response,
        data: {
          movie: {
            id: selectedMovie._id,
            title: selectedMovie.title,
            genre: selectedMovie.genre,
            poster: selectedMovie.poster
          },
          theatre: selectedTheatre,
          showTime,
          seats: selectedSeats,
          totalPrice,
          intent: { ...intent, surprise: true }
        }
      };

    } catch (error) {
      console.error('❌ Surprise Request Error:', error);
      return {
        success: false,
        message: "Oops! Something went wrong while preparing your surprise. Please try again! 🤖",
        data: null
      };
    }
  }

  generateSurpriseResponse(movie, theatre, showTime, seats, totalPrice) {
    let response = "I found a great movie for you tonight 🎬\n\n";
    
    response += `🎬 **Movie**: ${movie.title}\n`;
    if (movie.genre) {
      response += `🎭 **Genre**: ${movie.genre}\n`;
    }
    
    response += `🏢 **Theatre**: ${theatre}\n`;
    response += `⏰ **Time**: ${showTime}\n`;
    response += `🪑 **Seats**: ${seats.join(', ')}\n`;
    response += `💰 **Total Price**: ₹${totalPrice.toLocaleString('en-IN')}\n\n`;
    
    response += "I've picked the perfect movie for you! Enjoy the show! 🍿✨";
    
    return response;
  }

  async getNormalSeats(movieId, theatre, showTime, seatCount) {
    try {
      // Use existing recommendation service but force Normal seats (A-C rows)
      const seats = await getRecommendedSeats(movieId, theatre, showTime, seatCount, 'budget');
      
      // Filter for Normal seats only (rows A-C)
      const normalSeats = seats.filter(seat => {
        const row = seat.charAt(0);
        return ['A', 'B', 'C'].includes(row);
      });

      return normalSeats.length >= seatCount ? normalSeats.slice(0, seatCount) : [];
    } catch (error) {
      console.error('Error getting normal seats:', error);
      return [];
    }
  }

  generateBudgetResponse(option, intent) {
    let response = "Best budget option found 🎟\n\n";
    
    response += `🎬 **Movie**: ${option.movie.title}\n`;
    if (option.movie.genre) {
      response += `🎭 **Genre**: ${option.movie.genre}\n`;
    }
    
    response += `🏢 **Theatre**: ${option.theatre}\n`;
    response += `⏰ **Time**: ${option.showTime}\n`;
    response += `🪑 **Seats**: ${option.seats.join(', ')} (Normal seats)\n`;
    response += `💰 **Total**: ₹${option.totalPrice.toLocaleString('en-IN')}\n\n`;
    
    response += "Great value for money! Enjoy your movie! 🍿";
    
    return response;
  }

  generateFriendlyResponse(intent, movie, theatre, showTime, seats, totalPrice) {
    let response = "";
    
    // Add personalized greeting based on user type
    if (intent.userType === 'couple') {
      response = "I found the perfect romantic option for you ❤️\n\n";
    } else if (intent.userType === 'family') {
      response = "Great choice for family entertainment! 👨‍👩‍👧‍👦\n\n";
    } else if (intent.userType === 'elderly') {
      response = "I found a comfortable option for you 🌟\n\n";
    } else {
      response = "I found the best option for you ✨\n\n";
    }

    // Add movie details
    response += `🎬 **Movie**: ${movie.title}\n`;
    if (movie.genre) {
      response += `🎭 **Genre**: ${movie.genre}\n`;
    }
    
    // Add theatre and time
    response += `🏢 **Theatre**: ${theatre}\n`;
    response += `⏰ **Time**: ${showTime}\n`;
    
    // Add seats
    response += `🪑 **Seats**: ${seats.join(', ')}\n`;
    
    // Add price
    response += `💰 **Price**: ₹${totalPrice.toLocaleString('en-IN')}\n\n`;
    
    // Add closing message
    if (intent.userType === 'couple') {
      response += "Enjoy your romantic movie night! 💑";
    } else if (intent.userType === 'family') {
      response += "Have a wonderful family time! 🍿";
    } else if (intent.userType === 'elderly') {
      response += "Enjoy the show in comfort! 🎭";
    } else {
      response += "Enjoy your movie experience! 🎬";
    }

    return response;
  }
}

export default new ChatbotService();
