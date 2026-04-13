# CineAI ML Service

A Python Flask microservice providing machine learning-powered movie recommendations and seat scoring for the CineAI movie booking platform.

## Features

### Movie Recommendations
- **Hybrid Recommendation System**: Combines collaborative filtering and content-based filtering
- **Collaborative Filtering**: Uses user similarity with cosine similarity and k-NN
- **Content-Based Filtering**: Uses TF-IDF vectorization on movie genres and languages
- **Cold Start Handling**: Graceful fallback for new users
- **User Preferences**: Incorporates user's genre and language preferences

### Seat Scoring
- **Theater Modeling**: Realistic theater geometry with rows A-J, 14 seats per row
- **Viewing Metrics**: Calculates viewing angle, distance from screen, and center offset
- **User Types**: Optimized for different user types:
  - General: Balanced viewing experience
  - Couple: Intimate seating with good angles
  - Elderly: Easy access with optimal distance
  - Family: Centered group seating
  - Budget: Best value seats
- **Adjacent Seating**: Finds optimal adjacent seats for groups

## Installation

1. Navigate to the ml-service directory:
```bash
cd ml-service
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the service:
```bash
# Windows
start.bat

# Linux/Mac
./start.sh

# Or directly
python app.py
```

The service will start on `http://localhost:5001`

## API Endpoints

### Health Check
```
GET /health
```

### Movie Recommendations
```
POST /recommend
Content-Type: application/json

{
  "userId": "user123",
  "userGenres": ["action", "thriller"],
  "userLanguages": ["english"],
  "bookingHistory": [
    {"genres": ["action", "adventure"], "language": "english"},
    {"genres": ["thriller"], "language": "english"}
  ],
  "allMovies": [
    {"_id": "movie1", "genre": ["action", "thriller"], "language": "english", "title": "Movie 1"}
  ]
}
```

### Seat Scoring
```
POST /seat-score
Content-Type: application/json

{
  "seatGrid": {
    "A": {"1": true, "2": true, "3": false},
    "B": {"1": true, "2": false, "3": true}
  },
  "bookedSeats": ["A1", "A2", "B1"],
  "userType": "general",
  "seatCount": 3
}
```

## Integration with Node.js

The Node.js backend automatically calls this service for:
- Movie recommendations via `/api/recommendations/:userId`
- Seat scoring via `/api/recommendations/seat-score`

## Architecture

```
Node.js Backend (Port 5000)
    |
    | HTTP Calls
    v
Flask ML Service (Port 5001)
    |
    |-- Movie Recommender (recommender.py)
    |-- Seat Scorer (seat_scorer.py)
    |-- Flask App (app.py)
```

## Dependencies

- Flask 2.3.3 - Web framework
- Flask-CORS 4.0.0 - Cross-origin resource sharing
- scikit-learn 1.3.0 - Machine learning algorithms
- pandas 2.0.3 - Data manipulation
- numpy 1.24.3 - Numerical computing

## Performance

- **Recommendations**: < 1 second for typical datasets
- **Seat Scoring**: < 500ms for standard theater layouts
- **Concurrent Requests**: Handles multiple simultaneous requests
- **Memory Usage**: < 100MB for typical workloads

## Error Handling

- Graceful fallback when ML service is unavailable
- Input validation for all endpoints
- Comprehensive logging for debugging
- Timeout handling for external calls

## Development

To run in development mode with debug logging:
```bash
python app.py
```

The app will automatically restart on code changes when in debug mode.
