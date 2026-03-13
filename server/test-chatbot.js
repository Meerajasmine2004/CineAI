// Test examples for CineAI Chatbot
// These are sample requests you can send to test the chatbot

const testMessages = [
  {
    description: "Romantic movie request for couple",
    message: "Book 2 romantic movie tickets tonight"
  },
  {
    description: "Family movie request",
    message: "Suggest a movie for family"
  },
  {
    description: "Horror movie with specific time",
    message: "I want horror movie seats at 10 pm"
  },
  {
    description: "Elderly-friendly request",
    message: "Book seats for old parents"
  },
  {
    description: "Action movie evening",
    message: "Looking for action movie this evening"
  },
  {
    description: "Comedy movie with number",
    message: "Need 3 comedy tickets for tomorrow"
  },
  {
    description: "Generic movie request",
    message: "I want to watch a movie"
  },
  {
    description: "Morning show request",
    message: "Book morning show for family"
  },
  {
    description: "Date night request",
    message: "Planning a date night tonight"
  },
  {
    description: "Multiple requirements",
    message: "Book 4 family comedy tickets for evening show"
  }
];

// How to test with curl or any API client:
/*
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Book 2 romantic movie tickets tonight"}'
*/

// Expected response structure:
/*
{
  "success": true,
  "message": "I found the perfect romantic option for you ❤️\n\n🎬 **Movie**: Love Again\n🎭 **Genre**: Romance\n🏢 **Theatre**: PVR Phoenix\n⏰ **Time**: 10:00 PM\n🪑 **Seats**: E7, E8\n💰 **Price**: ₹500\n\nEnjoy your romantic movie night! 💑",
  "data": {
    "movie": {
      "id": "movie_id",
      "title": "Love Again",
      "genre": "Romance",
      "poster": "poster_url"
    },
    "theatre": "PVR Phoenix",
    "showTime": "10:00 PM",
    "seats": ["E7", "E8"],
    "totalPrice": 500,
    "intent": {
      "genre": "romance",
      "seatCount": 2,
      "showtime": "10:00 PM",
      "userType": "couple"
    }
  }
}
*/

console.log('CineAI Chatbot Test Examples:');
console.log('================================');
testMessages.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.description}`);
  console.log(`   Message: "${test.message}"`);
});

console.log('\nTo test, start your server and send POST requests to /api/chatbot');
console.log('Example curl command included in comments above');
