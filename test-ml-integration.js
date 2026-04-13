// Test script to verify Flask ML service integration
import axios from 'axios';

const testFlaskIntegration = async () => {
  console.log('Testing Flask ML Service Integration...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing Flask health check...');
    const healthResponse = await axios.get('http://localhost:5001/health');
    console.log('Health check response:', healthResponse.data);
    console.log('Health check: PASSED\n');

    // Test 2: Movie recommendations
    console.log('2. Testing movie recommendations...');
    const recommendPayload = {
      userId: 'test-user-123',
      userGenres: ['action', 'thriller'],
      userLanguages: ['english'],
      bookingHistory: [
        { genres: ['action', 'adventure'], language: 'english' },
        { genres: ['thriller'], language: 'english' }
      ],
      allMovies: [
        { _id: 'movie1', genre: ['action', 'thriller'], language: 'english', title: 'Action Movie 1' },
        { _id: 'movie2', genre: ['romance'], language: 'english', title: 'Romance Movie' },
        { _id: 'movie3', genre: ['action'], language: 'hindi', title: 'Hindi Action' }
      ]
    };

    const recommendResponse = await axios.post('http://localhost:5001/recommend', recommendPayload);
    console.log('Recommendations received:', recommendResponse.data.recommendations.length);
    console.log('Top recommendation:', recommendResponse.data.recommendations[0]);
    console.log('Movie recommendations: PASSED\n');

    // Test 3: Seat scoring
    console.log('3. Testing seat scoring...');
    const seatPayload = {
      seatGrid: {
        'A': { '1': true, '2': true, '3': false },
        'B': { '1': true, '2': false, '3': true },
        'C': { '1': true, '2': true, '3': true }
      },
      bookedSeats: ['A1', 'A2', 'B1'],
      userType: 'general',
      seatCount: 2
    };

    const seatResponse = await axios.post('http://localhost:5001/seat-score', seatPayload);
    console.log('Seat scoring result:', seatResponse.data.result);
    console.log('Seat scoring: PASSED\n');

    console.log('All tests PASSED! Flask ML Service is working correctly.');
    return true;

  } catch (error) {
    console.error('Test FAILED:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\nFlask ML Service is not running.');
      console.log('Please start the Flask service:');
      console.log('  cd ml-service');
      console.log('  python app.py');
    }
    
    return false;
  }
};

// Test Node.js integration
const testNodeIntegration = async () => {
  console.log('Testing Node.js integration with Flask...\n');

  try {
    // This would normally be called from the Node.js route
    const payload = {
      userId: 'integration-test',
      userGenres: ['comedy', 'drama'],
      userLanguages: ['english'],
      bookingHistory: [],
      allMovies: [
        { _id: 'test1', genre: ['comedy'], language: 'english', title: 'Test Comedy' }
      ]
    };

    const response = await axios.post('http://localhost:5001/recommend', payload, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Node.js integration response:', response.data);
    console.log('Node.js integration: PASSED');
    return true;

  } catch (error) {
    console.error('Node.js integration FAILED:', error.message);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('='.repeat(60));
  console.log('CINEAI ML SERVICE INTEGRATION TESTS');
  console.log('='.repeat(60));
  console.log('');

  const flaskTestsPassed = await testFlaskIntegration();
  console.log('');

  if (flaskTestsPassed) {
    await testNodeIntegration();
  }

  console.log('\n' + '='.repeat(60));
  console.log('TESTS COMPLETED');
  console.log('='.repeat(60));
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { testFlaskIntegration, testNodeIntegration, runAllTests };
