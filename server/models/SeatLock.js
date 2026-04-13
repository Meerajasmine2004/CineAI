import mongoose from 'mongoose';

const seatLockSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// TTL index - automatically removes expired locks after 0 seconds
seatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SeatLock = mongoose.model('SeatLock', seatLockSchema);

export default SeatLock;
