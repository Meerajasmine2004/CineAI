from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from recommender import MovieRecommender
from seat_scorer import SeatScorer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize ML components
movie_recommender = MovieRecommender()
seat_scorer = SeatScorer()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'CineAI ML Service',
        'version': '1.0.0'
    })

@app.route('/recommend', methods=['POST'])
def recommend_movies():
    """
    Movie recommendation endpoint using hybrid collaborative + content filtering
    
    Expected input:
    {
        "userId": "user123",
        "userGenres": ["action", "thriller"],
        "userLanguages": ["english"],
        "bookingHistory": [
            {"genres": ["action", "adventure"], "language": "english"},
            {"genres": ["thriller"], "language": "english"}
        ],
        "allMovies": [
            {"_id": "movie1", "genre": ["action", "thriller"], "language": "english", "title": "Movie 1"},
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['userId', 'userGenres', 'userLanguages', 'bookingHistory', 'allMovies']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        user_id = data['userId']
        user_genres = data['userGenres'] or []
        user_languages = data['userLanguages'] or []
        booking_history = data['bookingHistory'] or []
        all_movies = data['allMovies'] or []
        
        logger.info(f"Generating recommendations for user: {user_id}")
        logger.info(f"User preferences - Genres: {user_genres}, Languages: {user_languages}")
        logger.info(f"Booking history: {len(booking_history)} records")
        logger.info(f"Available movies: {len(all_movies)}")
        
        # Generate recommendations
        recommendations = movie_recommender.hybrid_recommendation(
            user_id=user_id,
            user_genres=user_genres,
            user_languages=user_languages,
            booking_history=booking_history,
            all_movies=all_movies
        )
        
        logger.info(f"Generated {len(recommendations)} recommendations")
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'user_id': user_id
        })
        
    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}")
        return jsonify({
            'error': 'Internal server error during recommendation',
            'details': str(e)
        }), 500

@app.route('/seat-score', methods=['POST'])
def score_seats():
    """
    Seat scoring endpoint for optimal seat selection
    
    Expected input:
    {
        "seatGrid": {
            "A": {"1": true, "2": true, ...},
            "B": {"1": true, "2": true, ...},
            ...
        },
        "bookedSeats": ["A1", "A2", "B5"],
        "userType": "general",  # general, couple, elderly, family, budget
        "seatCount": 3
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['seatGrid', 'bookedSeats', 'userType', 'seatCount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        seat_grid = data['seatGrid'] or {}
        booked_seats = data['bookedSeats'] or []
        user_type = data['userType']
        seat_count = data['seatCount']
        
        # Validate user type
        valid_user_types = ['general', 'couple', 'elderly', 'family', 'budget']
        if user_type not in valid_user_types:
            return jsonify({
                'error': f'Invalid user type. Must be one of: {valid_user_types}'
            }), 400
        
        # Validate seat count
        if not isinstance(seat_count, int) or seat_count < 1 or seat_count > 10:
            return jsonify({
                'error': 'Seat count must be an integer between 1 and 10'
            }), 400
        
        logger.info(f"Finding optimal seats for {user_type} user, {seat_count} seats")
        logger.info(f"Booked seats: {len(booked_seats)}")
        logger.info(f"Available rows: {list(seat_grid.keys())}")
        
        # Find best seats
        result = seat_scorer.find_best_adjacent_seats(
            seat_grid=seat_grid,
            booked_seats=booked_seats,
            user_type=user_type,
            seat_count=seat_count
        )
        
        logger.info(f"Recommended seats: {result['seats']}, Score: {result['score']}")
        
        return jsonify({
            'success': True,
            'result': result,
            'user_type': user_type,
            'seat_count': seat_count
        })
        
    except Exception as e:
        logger.error(f"Seat scoring error: {str(e)}")
        return jsonify({
            'error': 'Internal server error during seat scoring',
            'details': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': ['/health', '/recommend', '/seat-score']
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    logger.info("Starting CineAI ML Service on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
