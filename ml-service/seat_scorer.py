import numpy as np
from typing import List, Dict, Tuple, Optional
import math

class SeatScorer:
    """
    Advanced seat scoring system for theater recommendations
    Models theater geometry and user preferences for optimal seat selection
    """
    
    def __init__(self):
        # Theater configuration
        self.rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
        self.seats_per_row = 14
        self.screen_distance = 10  # meters from front row to screen
        self.row_spacing = 0.9     # meters between rows
        self.seat_spacing = 0.5    # meters between seats
        
        # User type weights for scoring formula
        self.weights = {
            'general': {'distance': 0.4, 'angle': 0.3, 'center': 0.3},
            'couple': {'distance': 0.2, 'angle': 0.5, 'center': 0.3},
            'elderly': {'distance': 0.6, 'angle': 0.2, 'center': 0.2},
            'family': {'distance': 0.3, 'angle': 0.2, 'center': 0.5},
            'budget': {'distance': 0.7, 'angle': 0.2, 'center': 0.1}
        }
        
        # Preferred rows by user type
        self.preferred_rows = {
            'general': ['E', 'F', 'D', 'G'],
            'couple': ['E', 'F', 'D', 'G'],
            'elderly': ['A', 'B', 'C', 'D'],
            'family': ['D', 'E', 'F', 'G'],
            'budget': ['A', 'B', 'C']
        }
    
    def get_seat_position(self, row: str, seat_number: int) -> Tuple[float, float, float]:
        """
        Calculate 3D position of a seat in the theater
        
        Args:
            row: Row letter (A-J)
            seat_number: Seat number (1-14)
            
        Returns:
            Tuple of (x, y, z) coordinates
        """
        row_index = self.rows.index(row)
        
        # X coordinate (horizontal position, center is 0)
        x = (seat_number - 7.5) * self.seat_spacing
        
        # Y coordinate (depth from screen)
        y = self.screen_distance + (row_index * self.row_spacing)
        
        # Z coordinate (height, assuming flat floor)
        z = 0
        
        return x, y, z
    
    def calculate_viewing_angle(self, row: str, seat_number: int) -> float:
        """
        Calculate viewing angle from seat to screen center
        
        Args:
            row: Row letter
            seat_number: Seat number
            
        Returns:
            Viewing angle in degrees
        """
        x, y, z = self.get_seat_position(row, seat_number)
        
        # Screen is at origin, centered
        screen_center_x, screen_center_y = 0, 0
        
        # Calculate angle using trigonometry
        horizontal_distance = abs(x)
        vertical_distance = y
        
        # Angle from seat to screen center
        angle_rad = math.atan2(horizontal_distance, vertical_distance)
        angle_deg = math.degrees(angle_rad)
        
        return angle_deg
    
    def calculate_distance_from_screen(self, row: str) -> float:
        """
        Calculate distance from seat to screen
        
        Args:
            row: Row letter
            
        Returns:
            Distance in meters
        """
        row_index = self.rows.index(row)
        return self.screen_distance + (row_index * self.row_spacing)
    
    def calculate_center_offset(self, seat_number: int) -> float:
        """
        Calculate horizontal offset from center
        
        Args:
            seat_number: Seat number
            
        Returns:
            Offset from center in meters
        """
        return abs(seat_number - 7.5) * self.seat_spacing
    
    def calculate_seat_score(self, row: str, seat_number: int, user_type: str) -> float:
        """
        Calculate individual seat score based on user preferences
        
        Args:
            row: Row letter
            seat_number: Seat number
            user_type: Type of user (general, couple, elderly, family, budget)
            
        Returns:
            Seat score (higher is better)
        """
        weights = self.weights.get(user_type, self.weights['general'])
        
        # Calculate metrics
        distance = self.calculate_distance_from_screen(row)
        angle = self.calculate_viewing_angle(row, seat_number)
        center_offset = self.calculate_center_offset(seat_number)
        
        # Normalize and weight the metrics
        # Lower distance = higher score (inverse relationship)
        distance_score = 1.0 / (distance / 10.0)  # Normalize by typical distance
        
        # Optimal angle is around 15-30 degrees, penalize extreme angles
        if 15 <= angle <= 30:
            angle_score = 1.0
        else:
            angle_score = 1.0 / (1.0 + abs(angle - 22.5) / 22.5)
        
        # Lower center offset = higher score
        center_score = 1.0 / (1.0 + center_offset / 2.0)
        
        # Apply weights
        final_score = (weights['distance'] * distance_score + 
                      weights['angle'] * angle_score + 
                      weights['center'] * center_score)
        
        return final_score
    
    def find_adjacent_seats(self, row: str, start_seat: int, seat_count: int, 
                          seat_grid: Dict, booked_seats: List[str]) -> Optional[List[str]]:
        """
        Find adjacent seats starting from a given position
        
        Args:
            row: Row letter
            start_seat: Starting seat number
            seat_count: Number of seats needed
            seat_grid: Available seats grid
            booked_seats: List of already booked seats
            
        Returns:
            List of adjacent seat IDs or None if not available
        """
        adjacent_seats = []
        
        for i in range(seat_count):
            seat_number = start_seat + i
            seat_id = f"{row}{seat_number}"
            
            # Check if seat exists and is available
            if (seat_number > self.seats_per_row or 
                seat_id in booked_seats or 
                seat_id not in seat_grid.get(row, {})):
                return None
            
            adjacent_seats.append(seat_id)
        
        return adjacent_seats if len(adjacent_seats) == seat_count else None
    
    def find_best_adjacent_seats(self, seat_grid: Dict, booked_seats: List[str], 
                               user_type: str, seat_count: int) -> Dict:
        """
        Find the best adjacent seats for a group
        
        Args:
            seat_grid: Available seats grid
            booked_seats: List of already booked seats
            user_type: Type of user
            seat_count: Number of seats needed
            
        Returns:
            Dictionary with best seats, score, and explanation
        """
        best_seats = None
        best_score = 0
        best_explanation = {}
        
        preferred_rows_list = self.preferred_rows.get(user_type, self.preferred_rows['general'])
        
        # Search through preferred rows first
        for row in preferred_rows_list:
            if row not in seat_grid:
                continue
                
            # Try different starting positions
            for start_seat in range(1, self.seats_per_row - seat_count + 2):
                adjacent_seats = self.find_adjacent_seats(row, start_seat, seat_count, 
                                                         seat_grid, booked_seats)
                
                if adjacent_seats:
                    # Calculate average score for the group
                    total_score = 0
                    seat_details = []
                    
                    for seat_id in adjacent_seats:
                        seat_number = int(seat_id[1:])  # Extract number from seat ID
                        seat_score = self.calculate_seat_score(row, seat_number, user_type)
                        total_score += seat_score
                        
                        seat_details.append({
                            'seat': seat_id,
                            'score': round(seat_score, 3),
                            'distance': round(self.calculate_distance_from_screen(row), 1),
                            'angle': round(self.calculate_viewing_angle(row, seat_number), 1),
                            'center_offset': round(self.calculate_center_offset(seat_number), 1)
                        })
                    
                    average_score = total_score / len(adjacent_seats)
                    
                    if average_score > best_score:
                        best_score = average_score
                        best_seats = adjacent_seats
                        
                        # Generate explanation
                        first_seat = adjacent_seats[0]
                        first_seat_number = int(first_seat[1:])
                        
                        best_explanation = {
                            'angle': round(self.calculate_viewing_angle(row, first_seat_number), 1),
                            'distance': round(self.calculate_distance_from_screen(row), 1),
                            'center_score': round(1.0 / (1.0 + self.calculate_center_offset(first_seat_number) / 2.0), 3),
                            'reason': self._generate_seat_reason(row, user_type, average_score),
                            'seat_details': seat_details
                        }
        
        return {
            'seats': best_seats or [],
            'score': round(best_score, 3),
            'explanation': best_explanation
        }
    
    def _generate_seat_reason(self, row: str, user_type: str, score: float) -> str:
        """
        Generate explanation for seat recommendation
        """
        row_index = self.rows.index(row)
        
        if user_type == 'elderly':
            if row_index <= 2:  # Rows A-C
                return "Easy access with optimal viewing distance"
            else:
                return "Comfortable viewing position"
        elif user_type == 'couple':
            if 3 <= row_index <= 5:  # Rows D-F
                return "Intimate setting with perfect viewing angle"
            else:
                return "Good viewing experience"
        elif user_type == 'family':
            if 3 <= row_index <= 6:  # Rows D-G
                return "Family-friendly with centered viewing"
            else:
                return "Suitable for family viewing"
        elif user_type == 'budget':
            if row_index <= 2:  # Rows A-C
                return "Best value with clear view"
            else:
                return "Economical choice"
        else:  # general
            if 3 <= row_index <= 5:  # Rows D-F
                return "Optimal viewing experience"
            else:
                return "Good viewing position"
