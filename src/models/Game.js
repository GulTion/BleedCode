// models/Game.js
import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  // Consider if you need a custom gameid or if MongoDB's default _id is sufficient.
  // If using a custom one:
  gameid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username1: {
    type: String,
    required: [true, "Username of player 1 is required."],
    index: true, // Index if you search games by player often
  },
  username2: {
    type: String,
    required: [true, "Username of player 2 is required."],
    index: true, // Index if you search games by player often
  },
  user1rating: { // Rating of user 1 *at the time the game was played*
    type: Number,
    required: [true, "Rating of player 1 is required."]
  },
  user2rating: { // Rating of user 2 *at the time the game was played*
    type: Number,
    required: [true, "Rating of player 2 is required."]
  },
  winnerusername: { // Can be username1, username2, or potentially null/specific string for a draw
    type: String,
    default: null, // Default to null, update when game finishes
  },
  seconds: { // Duration of the game in seconds
    type: Number,
    required: [true, "Game duration in seconds is required."],
    min: 0,
  },
  user1states: { // String representation of player 1's game states/moves (e.g., PGN, JSON)
    type: String,
    required: true,
  },
  user1timestamps: { // Array of timestamps corresponding to player 1's states/moves
    type: [Date],
    required: true,
    default: [],
  },
  user2states: { // String representation of player 2's game states/moves
    type: String,
    required: true,
  },
  user2timestamps: { // Array of timestamps corresponding to player 2's states/moves
    type: [Date],
    required: true,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
  // You might want to add a 'status' field (e.g., 'ongoing', 'completed', 'draw', 'aborted')
  // status: {
  //   type: String,
  //   enum: ['ongoing', 'completed', 'draw', 'aborted'],
  //   default: 'ongoing',
  //   required: true,
  // }
});

// Prevent model overwrite during hot-reloading
export default mongoose.models.Game || mongoose.model('Game', GameSchema);