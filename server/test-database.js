// Test database connection and movie data
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';

dotenv.config();

const testDatabase = async () => {
  try {
    console.log('🔍 Testing CineAI Database Connection');
    console.log('=====================================\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');

    // Check movie count
    const movieCount = await Movie.countDocuments();
    console.log(`📊 Total Movies in Database: ${movieCount}`);

    if (movieCount === 0) {
      console.log('❌ No movies found in database!');
      console.log('🎬 Creating sample movies...');
      
      // Create sample movies
      const sampleMovies = [
        {
          title: "Love Again",
          genre: ["romance", "drama"],
          language: "English",
          poster: "https://example.com/love-again.jpg",
          duration: 120,
          rating: 4.5,
          releaseDate: new Date('2023-05-05'),
          description: "A romantic story about second chances at love."
        },
        {
          title: "Fast & Furious 10",
          genre: ["action", "thriller"],
          language: "English",
          poster: "https://example.com/fast-furious.jpg",
          duration: 140,
          rating: 4.2,
          releaseDate: new Date('2023-05-19'),
          description: "High-octane action and family loyalty."
        },
        {
          title: "The Super Mario Bros. Movie",
          genre: ["family", "comedy", "animation"],
          language: "English",
          poster: "https://example.com/mario.jpg",
          duration: 92,
          rating: 4.0,
          releaseDate: new Date('2023-04-05'),
          description: "Animated adventure for the whole family."
        },
        {
          title: "Evil Dead Rise",
          genre: ["horror", "thriller"],
          language: "English",
          poster: "https://example.com/evil-dead.jpg",
          duration: 96,
          rating: 3.8,
          releaseDate: new Date('2023-04-21'),
          description: "Terrifying horror experience."
        },
        {
          title: "Guardians of the Galaxy Vol. 3",
          genre: ["action", "sci-fi", "comedy"],
          language: "English",
          poster: "https://example.com/guardians.jpg",
          duration: 150,
          rating: 4.6,
          releaseDate: new Date('2023-05-05'),
          description: "Epic space adventure with humor."
        }
      ];

      await Movie.insertMany(sampleMovies);
      console.log('✅ Created 5 sample movies');
    } else {
      // Show sample movies
      const movies = await Movie.find().limit(5);
      console.log('\n📋 Sample Movies:');
      movies.forEach((movie, index) => {
        console.log(`${index + 1}. ${movie.title} - ${movie.genre.join(', ')}`);
      });
    }

    console.log('\n✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testDatabase();
