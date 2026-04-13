import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple

class MovieRecommender:
    """
    Hybrid movie recommendation system combining collaborative filtering and content-based filtering
    """
    
    def __init__(self):
        self.collaborative_weight = 0.6
        self.content_weight = 0.4
        self.tfidf_vectorizer = TfidfVectorizer(stop_words='english')
        
    def build_user_genre_matrix(self, booking_history: List[Dict]) -> pd.DataFrame:
        """
        Build user-genre interaction matrix from booking history
        
        Args:
            booking_history: List of booking records with genres and language
            
        Returns:
            DataFrame with user-genre interactions
        """
        # Create a synthetic user-genre matrix
        # In production, this would use actual user data
        all_genres = ['action', 'romance', 'thriller', 'scifi', 'comedy', 
                     'horror', 'drama', 'adventure', 'animation', 'fantasy', 'crime', 'documentary']
        
        # Create user profile based on booking history
        user_profile = {genre: 0 for genre in all_genres}
        
        for booking in booking_history:
            if 'genres' in booking and isinstance(booking['genres'], list):
                for genre in booking['genres']:
                    if genre in user_profile:
                        user_profile[genre] += 1
                        
        # Convert to DataFrame
        df = pd.DataFrame([user_profile])
        return df
    
    def collaborative_filtering(self, user_profile: pd.DataFrame, all_movies: List[Dict]) -> Dict:
        """
        Collaborative filtering using user similarity
        
        Args:
            user_profile: User's genre preferences
            all_movies: List of all available movies
            
        Returns:
            Dictionary with movie recommendations and scores
        """
        try:
            # Create synthetic user-movie matrix for demonstration
            # In production, this would use real user data
            num_users = 100  # Synthetic users
            all_genres = ['action', 'romance', 'thriller', 'scifi', 'comedy', 
                         'horror', 'drama', 'adventure', 'animation', 'fantasy', 'crime', 'documentary']
            
            # Generate synthetic user preferences
            np.random.seed(42)
            synthetic_users = np.random.randint(0, 5, (num_users, len(all_genres)))
            
            # Add current user to the matrix
            current_user_vector = [user_profile.iloc[0].get(genre, 0) for genre in all_genres]
            user_matrix = np.vstack([synthetic_users, current_user_vector])
            
            # Find similar users using cosine similarity
            n_neighbors = min(10, len(user_matrix) - 1)
            knn = NearestNeighbors(n_neighbors=n_neighbors, metric='cosine')
            knn.fit(user_matrix)
            
            distances, indices = knn.kneighbors([current_user_vector])
            
            # Get recommendations from similar users
            similar_users = indices[0][1:]  # Exclude the user itself
            
            # For demonstration, score movies based on genre similarity
            collaborative_scores = {}
            
            for movie in all_movies:
                movie_genres = movie.get('genre', [])
                if isinstance(movie_genres, str):
                    movie_genres = [movie_genres]
                
                # Calculate similarity score
                genre_match_score = 0
                for genre in movie_genres:
                    if genre in current_user_vector and current_user_vector[all_genres.index(genre)] > 0:
                        genre_match_score += 1
                
                collaborative_scores[movie['_id']] = genre_match_score / len(movie_genres) if movie_genres else 0
            
            return collaborative_scores
            
        except Exception as e:
            print(f"Collaborative filtering error: {e}")
            return {}
    
    def content_based_filtering(self, user_genres: List[str], user_languages: List[str], all_movies: List[Dict]) -> Dict:
        """
        Content-based filtering using TF-IDF on movie genres and languages
        
        Args:
            user_genres: User's preferred genres
            user_languages: User's preferred languages
            all_movies: List of all available movies
            
        Returns:
            Dictionary with movie recommendations and scores
        """
        try:
            # Create user preference string
            user_preference_text = ' '.join(user_genres + user_languages)
            
            # Create movie content strings
            movie_contents = []
            movie_ids = []
            
            for movie in all_movies:
                movie_genres = movie.get('genre', [])
                if isinstance(movie_genres, str):
                    movie_genres = [movie_genres]
                
                movie_language = movie.get('language', '')
                content = ' '.join(movie_genres + [movie_language])
                movie_contents.append(content)
                movie_ids.append(movie['_id'])
            
            # Create TF-IDF vectors
            all_texts = [user_preference_text] + movie_contents
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(all_texts)
            
            # Calculate cosine similarity between user and movies
            user_vector = tfidf_matrix[0:1]
            movie_vectors = tfidf_matrix[1:]
            
            similarities = cosine_similarity(user_vector, movie_vectors).flatten()
            
            # Create content-based scores
            content_scores = {}
            for i, movie_id in enumerate(movie_ids):
                content_scores[movie_id] = similarities[i]
            
            return content_scores
            
        except Exception as e:
            print(f"Content-based filtering error: {e}")
            return {}
    
    def hybrid_recommendation(self, user_id: str, user_genres: List[str], user_languages: List[str], 
                            booking_history: List[Dict], all_movies: List[Dict]) -> List[Dict]:
        """
        Hybrid recommendation combining collaborative and content-based filtering
        
        Args:
            user_id: Current user ID
            user_genres: User's preferred genres
            user_languages: User's preferred languages
            booking_history: User's booking history
            all_movies: List of all available movies
            
        Returns:
            List of top 5 recommended movies with scores
        """
        try:
            # Handle cold start
            if not booking_history and not user_genres:
                # Return top trending movies (random selection for demo)
                trending_movies = all_movies[:5]
                return [
                    {
                        '_id': movie['_id'],
                        'title': movie.get('title', 'Unknown'),
                        'score': 0.5,
                        'reason': 'Trending movie'
                    }
                    for movie in trending_movies
                ]
            
            # Collaborative filtering
            collaborative_scores = {}
            if booking_history:
                user_profile = self.build_user_genre_matrix(booking_history)
                collaborative_scores = self.collaborative_filtering(user_profile, all_movies)
            
            # Content-based filtering
            content_scores = self.content_based_filtering(user_genres, user_languages, all_movies)
            
            # Combine scores
            final_scores = {}
            
            for movie in all_movies:
                movie_id = movie['_id']
                
                collab_score = collaborative_scores.get(movie_id, 0)
                content_score = content_scores.get(movie_id, 0)
                
                # Hybrid scoring
                if booking_history and user_genres:
                    # Both methods available
                    final_score = (self.collaborative_weight * collab_score + 
                                 self.content_weight * content_score)
                elif booking_history:
                    # Only collaborative
                    final_score = collab_score
                else:
                    # Only content-based
                    final_score = content_score
                
                final_scores[movie_id] = final_score
            
            # Sort by score and get top 5
            sorted_movies = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)
            
            recommendations = []
            for movie_id, score in sorted_movies[:5]:
                # Find movie details
                movie_details = next((m for m in all_movies if m['_id'] == movie_id), None)
                if movie_details:
                    reason = self._generate_reason(score, booking_history, user_genres, user_languages)
                    recommendations.append({
                        '_id': movie_id,
                        'title': movie_details.get('title', 'Unknown'),
                        'score': round(score, 3),
                        'reason': reason
                    })
            
            return recommendations
            
        except Exception as e:
            print(f"Hybrid recommendation error: {e}")
            # Return fallback recommendations
            return [
                {
                    '_id': movie['_id'],
                    'title': movie.get('title', 'Unknown'),
                    'score': 0.1,
                    'reason': 'Fallback recommendation'
                }
                for movie in all_movies[:5]
            ]
    
    def _generate_reason(self, score: float, booking_history: List[Dict], 
                        user_genres: List[str], user_languages: List[str]) -> str:
        """
        Generate recommendation reason based on scoring method
        """
        if booking_history and user_genres:
            if score > 0.7:
                return "Similar users with your tastes loved this"
            else:
                return "Matches your preferences and viewing history"
        elif booking_history:
            return "Based on your viewing history"
        elif user_genres:
            return "Matches your favorite genres"
        else:
            return "Popular choice"
