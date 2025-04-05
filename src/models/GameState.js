import mongoose from 'mongoose';
import User from './User'; // Import the User model

const gameStateSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  digits: {
    type: [Number],
    required: true,
  },
  state: {
    type: [Number],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Add a pre-save hook to validate required fields
gameStateSchema.pre('save', async function (next) {
  if (!this.username) {
    return next(new Error('Username is required'));
  }

  // Check if the username exists in the User collection
  const userExists = await User.exists({ username: this.username });
  if (!userExists) {
    return next(new Error(`User with username "${this.username}" does not exist`));
  }

  next();
});

// Create a compound index for faster queries
gameStateSchema.index({ gameId: 1 });

export default mongoose.models.GameState || mongoose.model('GameState', gameStateSchema);
