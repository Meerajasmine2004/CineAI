// CineAI Conversational Chatbot Test Examples
// Test the new AI-powered conversational booking assistant

const conversationalTestScenarios = [
  {
    scenario: "Complete Booking in One Message",
    messages: [
      "Book 2 romantic movie tickets tonight"
    ],
    expectedIntent: "booking",
    expectedGenre: "romance",
    expectedSeats: 2,
    expectedShowTime: "10:00 PM",
    expectedUserType: "couple"
  },
  {
    scenario: "Conversational Booking - Step by Step",
    messages: [
      "I want to watch a movie",
      "Action movie",
      "Tonight",
      "2 tickets"
    ],
    expectedIntent: "booking",
    expectedGenre: "action",
    expectedSeats: 2,
    expectedShowTime: "10:00 PM"
  },
  {
    scenario: "Slang and Informal Language",
    messages: [
      "need 2 tkts for horror movie nite show"
    ],
    expectedIntent: "booking",
    expectedGenre: "horror",
    expectedSeats: 2,
    expectedShowTime: "10:00 PM"
  },
  {
    scenario: "Budget Booking with Slang",
    messages: [
      "cheap movie tickets tonight"
    ],
    expectedIntent: "budget_booking",
    expectedSeats: 1,
    expectedShowTime: "10:00 PM"
  },
  {
    scenario: "Surprise Me with Time",
    messages: [
      "surprise me with a good movie tonight"
    ],
    expectedIntent: "surprise_booking",
    expectedSeats: 2,
    expectedShowTime: "10:00 PM"
  },
  {
    scenario: "Family Booking with Abbreviations",
    messages: [
      "book movie for family tmr mrg"
    ],
    expectedIntent: "booking",
    expectedUserType: "family",
    expectedSeats: 4,
    expectedBookingDate: "tomorrow",
    expectedShowTime: "10:00 AM"
  },
  {
    scenario: "Elderly Parents Booking",
    messages: [
      "book movie for my parents evening"
    ],
    expectedIntent: "booking",
    expectedUserType: "elderly",
    expectedSeats: 2,
    expectedShowTime: "7:00 PM"
  },
  {
    scenario: "Movie Discovery",
    messages: [
      "what movies are showing"
    ],
    expectedIntent: "movie_discovery"
  },
  {
    scenario: "Seat Help",
    messages: [
      "where should I sit"
    ],
    expectedIntent: "seat_help"
  }
];

// Enhanced intent detection patterns
const intentPatterns = {
  budget_booking: ['cheap', 'cheapest', 'low price', 'budget', 'affordable', 'inexpensive', 'economy'],
  surprise_booking: ['surprise', 'anything', 'suggest', 'recommend', 'surprise me', 'suggest something', 'pick for me'],
  seat_help: ['seat', 'seating', 'where to sit', 'best seats', 'seat recommendation'],
  movie_discovery: ['what movies', 'what\'s playing', 'showing', 'movies', 'any movies', 'what\'s on'],
  booking: ['book', 'booking', 'ticket', 'tickets', 'tkts', 'watch', 'see', 'need to watch']
};

// Enhanced genre detection
const genreMap = {
  'romantic': 'romance', 'romance': 'romance', 'love': 'romance', 'love story': 'romance',
  'horror': 'horror', 'scary': 'horror', 'thriller': 'thriller', 'suspense': 'thriller',
  'family': 'family', 'kids': 'family', 'children': 'family', 'kid-friendly': 'family',
  'action': 'action', 'adventure': 'adventure', 'adventurous': 'adventure',
  'comedy': 'comedy', 'funny': 'comedy', 'laugh': 'comedy',
  'drama': 'drama', 'emotional': 'drama',
  'sci-fi': 'sci-fi', 'science fiction': 'sci-fi', 'scifi': 'sci-fi',
  'animated': 'animation', 'cartoon': 'animation', 'animation': 'animation'
};

// Enhanced time detection with slang
const timeMap = {
  'tmr': 'tomorrow', 'tomorrow': 'tomorrow', 'tom': 'tomorrow',
  'today': 'today', 'tonite': 'tonight', 'nite': 'tonight', 'tonight': 'tonight',
  'mrg': 'morning', 'morning': 'morning', 'today morning': 'morning',
  'afternoon': 'afternoon', 'aft': 'afternoon',
  'evening': 'evening', 'eve': 'evening',
  'night': 'night', 'tonight': 'night'
};

// User type detection
const userTypes = {
  'couple': ['couple', 'date', 'romantic'],
  'family': ['family', 'kids', 'children'],
  'elderly': ['parents', 'elderly', 'old', 'senior']
};

// Seat count detection
const numberWords = {
  'one': 1, 'single': 1, '1': 1,
  'two': 2, 'couple': 2, '2': 2,
  'three': 3, '3': 3,
  'four': 4, '4': 4,
  'five': 5, '5': 5,
  'six': 6, '6': 6,
  'seven': 7, '7': 7,
  'eight': 8, '8': 8,
  'nine': 9, '9': 9,
  'ten': 10, '10': 10
};

console.log('🤖 CineAI Conversational Chatbot Tests');
console.log('=====================================');

conversationalTestScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.scenario}`);
  console.log('   Messages:');
  scenario.messages.forEach((msg, msgIndex) => {
    console.log(`     ${msgIndex + 1}. "${msg}"`);
  });
  
  if (scenario.expectedIntent) {
    console.log(`   Expected Intent: ${scenario.expectedIntent}`);
  }
  if (scenario.expectedGenre) {
    console.log(`   Expected Genre: ${scenario.expectedGenre}`);
  }
  if (scenario.expectedSeats) {
    console.log(`   Expected Seats: ${scenario.expectedSeats}`);
  }
  if (scenario.expectedShowTime) {
    console.log(`   Expected Showtime: ${scenario.expectedShowTime}`);
  }
  if (scenario.expectedUserType) {
    console.log(`   Expected User Type: ${scenario.expectedUserType}`);
  }
  if (scenario.expectedBookingDate) {
    console.log(`   Expected Booking Date: ${scenario.expectedBookingDate}`);
  }
});

console.log('\n🎯 Enhanced Intent Detection:');
Object.entries(intentPatterns).forEach(([intent, keywords]) => {
  console.log(`\n${intent}:`);
  keywords.forEach(keyword => {
    console.log(`   - "${keyword}"`);
  });
});

console.log('\n🎭 Enhanced Genre Detection:');
Object.entries(genreMap).forEach(([keyword, genre]) => {
  console.log(`   "${keyword}" → ${genre}`);
});

console.log('\n⏰ Enhanced Time Detection:');
Object.entries(timeMap).forEach(([keyword, time]) => {
  console.log(`   "${keyword}" → ${time}`);
});

console.log('\n👥 User Type Detection:');
Object.entries(userTypes).forEach(([type, keywords]) => {
  console.log(`\n${type}:`);
  keywords.forEach(keyword => {
    console.log(`   - "${keyword}"`);
  });
});

console.log('\n🔢 Number Detection:');
Object.entries(numberWords).forEach(([word, num]) => {
  console.log(`   "${word}" → ${num}`);
});

console.log('\n💬 Conversational Flow Examples:');

console.log('\nExample 1: Step-by-Step Booking');
console.log('User: "I want to watch a movie"');
console.log('Bot: "I\'d be happy to help you book movie tickets! 🎬\n\nWhat genre of movie would you like to watch? (action, romance, comedy, horror, etc.)"');
console.log('User: "Action movie"');
console.log('Bot: "When would you like to watch? (morning, afternoon, evening, tonight)"');
console.log('User: "Tonight"');
console.log('Bot: "How many seats do you need?"');
console.log('User: "2"');
console.log('Bot: "I found a great option for you 🎬\n\n🎬 Movie: [Action Movie]\n🏢 Theatre: [Best Theatre]\n⏰ Time: 10:00 PM\n🪑 Seats: [Best Seats]\n💰 Total Price: ₹[Price]\n\nEnjoy your movie experience! ✨"');

console.log('\nExample 2: Complete Booking');
console.log('User: "Book 2 romantic movie tickets tonight"');
console.log('Bot: "I found the perfect romantic option for you ❤️\n\n🎬 Movie: [Romantic Movie]\n🏢 Theatre: [Best Theatre]\n⏰ Time: 10:00 PM\n🪑 Seats: [Corner Seats]\n💰 Total Price: ₹[Price]\n\nEnjoy your romantic movie night! 💑"');

console.log('\nExample 3: Slang Understanding');
console.log('User: "need 2 tkts for horror movie nite show"');
console.log('Bot: "I found a great option for you 🎬\n\n🎬 Movie: [Horror Movie]\n🏢 Theatre: [Best Theatre]\n⏰ Time: 10:00 PM\n🪑 Seats: [Best Seats]\n💰 Total Price: ₹[Price]\n\nEnjoy your movie experience! ✨"');

console.log('\n🧠 AI Features:');
console.log('✅ Natural Language Understanding (NLU)');
console.log('✅ Slang and Informal Language Support');
console.log('✅ Conversational Memory (Session-based)');
console.log('✅ Context-Aware Responses');
console.log('✅ Multi-Turn Conversations');
console.log('✅ Intent Detection with Confidence');
console.log('✅ Entity Extraction (Genre, Time, Seats)');
console.log('✅ User Type Recognition');
console.log('✅ Personalized Recommendations');
console.log('✅ Seamless Booking Integration');

console.log('\n📱 Expected UI Behavior:');
console.log('- Session persistence across page refreshes');
console.log('- Context-aware chat responses');
console.log('- Progressive information gathering');
console.log('- Booking cards with payment integration');
console.log('- Natural conversation flow');
console.log('- Error handling and fallbacks');

console.log('\n🧪 How to Test:');
console.log('1. Start CineAI application');
console.log('2. Click floating chatbot button');
console.log('3. Try each test scenario');
console.log('4. Verify intent detection accuracy');
console.log('5. Test conversational memory');
console.log('6. Check booking card generation');
console.log('7. Test payment flow integration');

console.log('\n🎬 Example Test Commands:');
console.log('curl -X POST http://localhost:5000/api/chatbot \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"message": "Book 2 romantic movie tickets tonight", "sessionId": "test_session_123"}\'');

console.log('\n🌟 Key Benefits:');
console.log('🎯 Zero-effort booking with natural language');
console.log('🤖 Human-like conversation experience');
console.log('🧠 Smart context awareness');
console.log('💬 Progressive information gathering');
console.log('🎭 Personalized recommendations');
console.log('📱 Seamless mobile experience');
console.log('⚡ Fast and efficient booking');
console.log('🔒 Session-based memory');

console.log('\nExpected Response Structure:');
console.log(JSON.stringify({
  success: true,
  message: "I found the perfect romantic option for you ❤️\n\n🎬 **Movie**: Love Again\n🏢 **Theatre**: PVR Phoenix\n⏰ **Time**: 10:00 PM\n🪑 **Seats**: E7, E8\n💰 **Total Price**: ₹500\n\nEnjoy your romantic movie night! 💑",
  data: {
    movie: { id: "movie_id", title: "Love Again", genre: "Romance" },
    theatre: "PVR Phoenix",
    showTime: "10:00 PM",
    seats: ["E7", "E8"],
    totalPrice: 500,
    intent: { genre: "romance", seatCount: 2, showtime: "10:00 PM", userType: "couple" }
  },
  sessionId: "session_1234567890_abc123"
}, null, 2));
