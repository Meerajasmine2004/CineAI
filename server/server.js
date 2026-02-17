import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import http from 'http';
import { connectDB } from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import testRoute from './routes/test.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// In-memory seat lock store
const seatLocks = {};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Lock seat
  socket.on('lockSeat', ({ movieId, showTime, seat }) => {
    const lockKey = `${movieId}_${showTime}_${seat}`;
    
    if (!seatLocks[lockKey]) {
      // Lock the seat
      seatLocks[lockKey] = socket.id;
      
      // Notify all users that seat is locked
      io.emit('seatLocked', { movieId, showTime, seat, lockedBy: socket.id });
      
      console.log(`Seat ${seat} locked by ${socket.id}`);
    } else {
      // Seat already locked
      socket.emit('seatAlreadyLocked', { movieId, showTime, seat, lockedBy: seatLocks[lockKey] });
      
      console.log(`Seat ${seat} already locked by ${seatLocks[lockKey]}`);
    }
  });

  // Unlock seat
  socket.on('unlockSeat', ({ movieId, showTime, seat }) => {
    const lockKey = `${movieId}_${showTime}_${seat}`;
    
    if (seatLocks[lockKey] === socket.id) {
      // Unlock the seat
      delete seatLocks[lockKey];
      
      // Notify all users that seat is unlocked
      io.emit('seatUnlocked', { movieId, showTime, seat });
      
      console.log(`Seat ${seat} unlocked by ${socket.id}`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove all locks held by this socket
    Object.keys(seatLocks).forEach(lockKey => {
      if (seatLocks[lockKey] === socket.id) {
        delete seatLocks[lockKey];
        io.emit('seatUnlocked', { 
          movieId: lockKey.split('_')[0], 
          showTime: lockKey.split('_')[1], 
          seat: lockKey.split('_')[2] 
        });
      }
    });
  });
});

// Export seatLocks for controllers to use
export { seatLocks, io };

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    msg: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "img-src": ["'self'", "data:", "https:", "http:"],
    },
  },
})); // Security headers
app.use(limiter); // Rate limiting
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
})); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies

// Routes
app.get('/api/test', testRoute);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
🎬 CineAI Backend Server Running 🎬
================================
Server: Express.js + Socket.io
Port: ${PORT}
Mode: ${process.env.NODE_ENV || 'development'}
Database: MongoDB
Socket.io: Enabled
Time: ${new Date().toLocaleString()}
================================
`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Error:Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Error:Uncaught Exception:', err);
  process.exit(1);
});

export default app;
