import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie is required']
  },
  showTime: {
    type: String,
    required: [true, 'Show time is required'],
    enum: ['morning', 'afternoon', 'evening', 'night']
  },
  seats: {
    type: [String],
    required: [true, 'Seats are required'],
    validate: {
      validator: function(seats) {
        return seats && seats.length > 0;
      },
      message: 'At least one seat must be selected'
    }
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
bookingSchema.index({ user: 1, movie: 1 });
bookingSchema.index({ bookingStatus: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
