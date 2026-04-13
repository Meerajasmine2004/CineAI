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
import recommendationRoutes from './routes/recommendation.js';
import SeatLock from './models/SeatLock.js';
import chatbotRoutes from './routes/chatbot.js';

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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Lock seat
  socket.on('lockSeat', async ({ movieId, theatre, showTime, bookingDate, seat, userId }) => {
    const lockKey = `${movieId}_${theatre}_${showTime}_${bookingDate}_${seat}`;
    const currentUserId = userId || socket.handshake.auth.userId || socket.id;

    try {
      // Check if seat is already locked
      const existingLock = await SeatLock.findOne({ key: lockKey });

      if (existingLock) {
        // Check if locked by same user
        if (existingLock.userId === currentUserId) {
          // Allow same user to reselect - update expiry
          await SeatLock.updateOne(
            { key: lockKey },
            { $set: { expiresAt: new Date(Date.now() + 5 * 60 * 1000) } }
          );
          
          // Confirm to current user
          socket.emit('seatLocked', {
            movieId,
            theatre,
            showTime,
            bookingDate,
            seat,
            lockedBy: currentUserId
          });
        } else {
          // Locked by different user
          socket.emit('seatAlreadyLocked', {
            movieId,
            theatre,
            showTime,
            bookingDate,
            seat
          });
        }
      } else {
        // Create new lock
        await SeatLock.create({
          key: lockKey,
          userId: currentUserId,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        // Broadcast to all users (including current user)
        io.emit('seatUpdate', {
          seatId: seat,
          lockedBy: currentUserId
        });

        console.log(`Seat ${seat} locked for ${lockKey} by ${currentUserId}`);
      }
    } catch (error) {
      console.error('Lock seat error:', error);
      socket.emit('seatAlreadyLocked', {
        movieId,
        theatre,
        showTime,
        bookingDate,
        seat
      });
    }
  });

  // Unlock seat
  socket.on('unlockSeat', async ({ movieId, theatre, showTime, bookingDate, seat }) => {
    const lockKey = `${movieId}_${theatre}_${showTime}_${bookingDate}_${seat}`;

    try {
      // Delete the lock from MongoDB
      const result = await SeatLock.deleteOne({ key: lockKey });

      if (result.deletedCount > 0) {
        // Lock was deleted successfully
        io.emit('seatUnlocked', {
          movieId,
          theatre,
          showTime,
          bookingDate,
          seat
        });

        console.log(`Seat ${seat} unlocked for ${lockKey} by ${socket.id}`);
      }
    } catch (error) {
      console.error('Unlock seat error:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.id}`);

    try {
      // Find and delete all locks created by this socket
      // Note: We don't track socket.id in MongoDB, so we'll clean up expired locks
      // In a production environment, you might want to track socket.id or user sessions
      
      // For now, we'll let the TTL handle expired locks automatically
      // But we can also clean up any locks that are very old (older than 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      await SeatLock.deleteMany({ 
        expiresAt: { $lt: fiveMinutesAgo } 
      });

      console.log(`Cleaned up expired locks for disconnected user ${socket.id}`);
    } catch (error) {
      console.error('Disconnect cleanup error:', error);
    }
  });
});

// Export io for controllers to use
export { io };

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
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/chatbot', chatbotRoutes);

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
