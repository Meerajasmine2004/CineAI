import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';

// Load environment variables
dotenv.config();

// Sample movie data
const sampleMovies = [
  {
    title: "Inception",
    description: "A skilled thief is offered a chance to have his criminal history erased as payment for the implantation of another person's idea into a target's subconscious.",
    poster: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
    genre: ["Action", "Sci-Fi", "Thriller"],
    language: ["English"],
    duration: 148,
    releaseDate: new Date("2010-07-16"),
    isComingSoon: false
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    genre: ["Action", "Crime", "Drama"],
    language: ["English"],
    duration: 152,
    releaseDate: new Date("2008-07-18"),
    isComingSoon: false
  },
  {
    title: "Avatar",
    description: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following orders and protecting the world he feels is his home.",
    poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
    genre: ["Action", "Sci-Fi", "Adventure"],
    language: ["English"],
    duration: 162,
    releaseDate: new Date("2009-12-18"),
    isComingSoon: false
  },
  {
    title: "Titanic",
    description: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    poster: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    genre: ["Drama", "Romance"],
    language: ["English"],
    duration: 194,
    releaseDate: new Date("1997-12-19"),
    isComingSoon: false
  },
  {
    title: "Gladiator",
    description: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    poster: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    genre: ["Action", "Drama", "Adventure"],
    language: ["English"],
    duration: 155,
    releaseDate: new Date("2000-05-05"),
    isComingSoon: false
  },
  {
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
    genre: ["Drama", "History", "Biography"],
    language: ["English"],
    duration: 180,
    releaseDate: new Date("2023-07-21"),
    isComingSoon: false
  },
  {
    title: "Dune",
    description: "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset while its heir becomes troubled by visions of a dark future.",
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    language: ["English"],
    duration: 155,
    releaseDate: new Date("2021-10-22"),
    isComingSoon: false
  },
  {
    title: "John Wick",
    description: "An ex-hitman comes out of retirement to track down the gangsters that killed his dog and stole his car.",
    poster: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
    genre: ["Action", "Crime", "Thriller"],
    language: ["English"],
    duration: 101,
    releaseDate: new Date("2014-10-24"),
    isComingSoon: false
  },
  {
    title: "Avengers: Endgame",
    description: "The Avengers assemble once more to reverse Thanos' actions and restore balance to the universe.",
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    genre: ["Action", "Adventure", "Sci-Fi"],
    language: ["English"],
    duration: 181,
    releaseDate: new Date("2019-04-26"),
    isComingSoon: false
  },
  {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9hGpLjrE9E4g40n5zb.jpg",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    language: ["English"],
    duration: 166,
    releaseDate: new Date("2024-03-01"),
    isComingSoon: true
  },
  {
    title: "Deadpool & Wolverine",
    description: "The duo of Deadpool and Wolverine team up for an action-packed adventure that breaks the fourth wall.",
    poster: "https://image.tmdb.org/t/p/w500/3c5xUsc3cIvJpG6p2yYJ6lQJvJd.jpg",
    genre: ["Action", "Comedy", "Adventure"],
    language: ["English"],
    duration: 127,
    releaseDate: new Date("2024-07-26"),
    isComingSoon: true
  },
  {
    title: "Joker: Folie à Deux",
    description: "Arthur Fleck returns to Arkham Asylum where he finds love and embarks on a musical journey.",
    poster: "https://image.tmdb.org/t/p/w500/51tqoR7KzYWydZxai6YxjF0x1u.jpg",
    genre: ["Drama", "Thriller", "Musical"],
    language: ["English"],
    duration: 138,
    releaseDate: new Date("2024-10-04"),
    isComingSoon: true
  }
];

// Connect to database and seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Drop the movies collection to avoid schema conflicts
    await mongoose.connection.db.dropCollection('movies');
    console.log('Dropped existing movies collection...');

    // Insert sample movies
    await Movie.insertMany(sampleMovies);
    console.log(`Successfully seeded ${sampleMovies.length} movies!`);

    console.log('\n🎬 Movie Seeding Complete! 🎬');
    console.log('================================');
    console.log(`Total Movies: ${sampleMovies.length}`);
    console.log(`Released: ${sampleMovies.filter(m => !m.isComingSoon).length}`);
    console.log(`Coming Soon: ${sampleMovies.filter(m => m.isComingSoon).length}`);
    console.log('================================');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeder
seedDatabase();
