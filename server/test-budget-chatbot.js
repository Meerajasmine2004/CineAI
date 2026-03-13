// CineAI Budget Chatbot Test Examples
// Test the new budget-based booking functionality

const budgetTestMessages = [
  {
    description: "Basic budget request",
    message: "Find cheapest seats tonight",
    expectedIntent: "budget",
    expectedSeats: "Normal seats (A-C rows)",
    expectedPrice: "₹200 per seat"
  },
  {
    description: "Alternative budget keywords",
    message: "Show cheapest movie tickets",
    expectedIntent: "budget",
    expectedSeats: "Normal seats (A-C rows)",
    expectedPrice: "₹200 per seat"
  },
  {
    description: "Low price request",
    message: "I want low price seats tonight",
    expectedIntent: "budget",
    expectedSeats: "Normal seats (A-C rows)",
    expectedPrice: "₹200 per seat"
  },
  {
    description: "Budget with specific time",
    message: "Find budget seats for evening show",
    expectedIntent: "budget",
    expectedSeats: "Normal seats (A-C rows)",
    expectedPrice: "₹200 per seat"
  },
  {
    description: "Affordable with seat count",
    message: "Book 3 affordable tickets",
    expectedIntent: "budget",
    expectedSeats: "Normal seats (A-C rows)",
    expectedPrice: "₹600 total"
  },
  {
    description: "Economy option",
    message: "Looking for economy movie tickets",
    expectedIntent: "budget",
    expectedSeats: "Normal seats (A-C rows)",
    expectedPrice: "₹200 per seat"
  },
  {
    description: "Inexpensive option",
    message: "I need inexpensive seats for tomorrow",
    expectedIntent: "budget",
    expectedSeats: "Normal seats (A-C rows)",
    expectedPrice: "₹200 per seat"
  }
];

// Expected response structure for budget requests
const expectedBudgetResponse = {
  success: true,
  message: "Best budget option found 🎟\n\n🎬 **Movie**: [Movie Name]\n🏢 **Theatre**: [Theatre Name]\n⏰ **Time**: [Show Time]\n🪑 **Seats**: [Seat Numbers] (Normal seats)\n💰 **Total**: ₹[Total Price]\n\nGreat value for money! Enjoy your movie! 🍿",
  data: {
    movie: {
      id: "movie_id",
      title: "Movie Title",
      genre: "Genre",
      poster: "poster_url"
    },
    theatre: "Theatre Name",
    showTime: "Show Time",
    seats: ["A5", "A6"], // Normal seats
    totalPrice: 400, // ₹200 x 2 seats
    intent: {
      budget: true,
      seatCount: 2,
      showtime: "7:00 PM"
    }
  }
};

// Budget detection keywords
const budgetKeywords = [
  'cheap',
  'cheapest', 
  'low price',
  'budget',
  'affordable',
  'inexpensive',
  'economy'
];

// Seat pricing structure
const seatPricing = {
  'Normal': { rows: ['A', 'B', 'C'], price: 200 },
  'Premium': { rows: ['D', 'E', 'F'], price: 250 },
  'VIP': { rows: ['G', 'H', 'I', 'J'], price: 350 }
};

// Test budget detection logic
console.log('🎟 CineAI Budget Chatbot Tests');
console.log('================================');

budgetTestMessages.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.description}`);
  console.log(`   Message: "${test.message}"`);
  console.log(`   Expected Intent: ${test.expectedIntent}`);
  console.log(`   Expected Seats: ${test.expectedSeats}`);
  console.log(`   Expected Price: ${test.expectedPrice}`);
});

console.log('\n💰 Budget Detection Keywords:');
budgetKeywords.forEach(keyword => {
  console.log(`   - "${keyword}" → triggers budget intent`);
});

console.log('\n🪑 Seat Pricing Structure:');
Object.entries(seatPricing).forEach(([category, details]) => {
  console.log(`   - ${category} (${details.rows.join('-')} rows): ₹${details.price}`);
});

console.log('\n🎯 Budget Algorithm Logic:');
console.log('   1. Detect budget keywords in message');
console.log('   2. Prioritize Normal seats (₹200) - cheapest option');
console.log('   3. Check earliest showtime for budget preference');
console.log('   4. Find available seats across multiple theatres');
console.log('   5. Return lowest total price option');

console.log('\n📱 Expected UI Behavior:');
console.log('   - Chatbot detects budget intent');
console.log('   - Returns Normal seats (A-C rows)');
console.log('   - Shows budget-friendly booking card');
console.log('   - "Proceed to Payment" button appears');
console.log('   - Redirects to payment page with budget data');

console.log('\n🧪 How to Test:');
console.log('1. Start the CineAI application');
console.log('2. Click the floating chatbot button');
console.log('3. Send any of the test messages above');
console.log('4. Verify budget intent detection');
console.log('5. Check that Normal seats are recommended');
console.log('6. Confirm pricing is ₹200 per seat');
console.log('7. Test booking card and payment flow');

console.log('\n🎬 Example Test Commands:');
console.log('curl -X POST http://localhost:5000/api/chatbot \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"message": "Find cheapest seats tonight"}\'');

console.log('\nExpected Response:');
console.log(JSON.stringify(expectedBudgetResponse, null, 2));
