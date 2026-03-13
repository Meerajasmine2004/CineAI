# CineAI Chatbot Backend

## 🎬 Smart Movie Booking Assistant

A comprehensive chatbot backend for the CineAI movie booking application that understands natural language and provides intelligent movie recommendations.

## 🚀 Features

### **Intent Detection**
- **Genre Recognition**: romantic, horror, family, action, comedy, drama, sci-fi, animation
- **Time Preferences**: morning, afternoon, evening, night, tonight
- **User Types**: couple, family, elderly
- **Seat Count**: Extracts numbers from natural language

### **Smart Recommendations**
- **Movie Selection**: Based on genre and user preferences
- **Theatre Recommendations**: Best theatre for selected movie
- **Seat Optimization**: Smart seat selection based on user type
- **Price Calculation**: Automatic pricing based on seat categories

### **Natural Language Processing**
```javascript
// Example messages the chatbot understands:
"Book 2 romantic movie tickets tonight"
"Suggest a movie for family"
"I want horror movie seats at 10 pm"
"Book seats for old parents"
"Looking for action movie this evening"
"Need 3 comedy tickets for tomorrow"
```

## 📡 API Endpoint

### **POST /api/chatbot**

**Request:**
```json
{
  "message": "Book 2 romantic movie tickets tonight"
}
```

**Response:**
```json
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
```

## 🧠 Intelligence Features

### **User Type Detection**
- **Couple**: Prefers corner seats (romantic experience)
- **Family**: Prefers center rows (D-F) (best for groups)
- **Elderly**: Prefers lower rows (A-C) (easy access)

### **Seat Pricing**
- **Normal** (Rows A-C): ₹200
- **Premium** (Rows D-F): ₹250
- **VIP** (Rows G-J): ₹350

### **Time Mapping**
- **Morning**: 10:00 AM
- **Afternoon**: 2:00 PM
- **Evening**: 7:00 PM
- **Night/Tonight**: 10:00 PM

## 🛠️ Technical Stack

- **Node.js** + **Express.js**
- **MongoDB** for data storage
- **Natural Language Processing** for intent detection
- **Integration** with existing recommendation services

## 📁 File Structure

```
server/
├── services/
│   ├── chatbotService.js     # Main chatbot logic
│   └── recommendationService.js # Existing recommendations
├── routes/
│   └── chatbot.js           # Chatbot API routes
└── server.js                # Main server with chatbot routes
```

## 🎯 Usage Examples

### **Romantic Movie Request**
```
Input: "Book 2 romantic movie tickets tonight"
Output: ❤️ Perfect romantic option with corner seats
```

### **Family Movie Request**
```
Input: "Suggest a movie for family"
Output: 👨‍👩‍👧‍👦 Family-friendly option with center seats
```

### **Horror Movie Request**
```
Input: "I want horror movie seats at 10 pm"
Output: 🎭 Scary movie with late night timing
```

### **Elderly-Friendly Request**
```
Input: "Book seats for old parents"
Output: 🌟 Comfortable lower row seats
```

## 🔧 Integration

The chatbot integrates seamlessly with existing CineAI services:
- **getRecommendations()** - Movie suggestions
- **getRecommendedTheatre()** - Best theatre selection
- **getRecommendedSeats()** - Smart seat allocation

## 🚀 Getting Started

1. The chatbot is already integrated into your CineAI backend
2. Endpoint is available at: `POST /api/chatbot`
3. Send natural language messages to get intelligent recommendations
4. Receive both structured data and friendly chat responses

## 🎨 Response Features

- **Personalized greetings** based on user type
- **Emoji-rich messages** for engaging experience
- **Structured data** for frontend integration
- **Error handling** with friendly fallbacks
- **Price formatting** with Indian currency standards

The chatbot provides a conversational interface that makes movie booking as simple as sending a text message! 🎬✨
