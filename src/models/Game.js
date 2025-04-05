// models/Game.js
import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  gameid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username1: {
    type: String,
    required: [true, "Username of player 1 is required."],
    index: true,
  },
  username2: {
    type: String,
    required: [true, "Username of player 2 is required."],
    index: true,
  },
  user1rating: {
    type: Number,
    required: [true, "Rating of player 1 is required."]
  },
  user2rating: {
    type: Number,
    required: [true, "Rating of player 2 is required."]
  },
  winnerusername: {
    type: String,
    default: null,
  },
  seconds: {
    type: Number,
    required: [true, "Game duration in seconds is required."],
    min: 0,
  },
  // --- MODIFIED FIELDS ---
  user1states: { // Array of game states/moves for player 1
    type: [String], // Changed to Array of Strings
    required: true,
    default: [],   // Default to empty array
  },
  user1timestamps: { // Array of timestamps corresponding to player 1's states
    type: [Date],   // Stays as Array of Dates
    required: true,
    default: [Date.now()],   // Default to empty array
  },
  user2states: { // Array of game states/moves for player 2
    type: [String], // Changed to Array of Strings
    required: true,
    default: [],   // Default to empty array
  },
  user2timestamps: { // Array of timestamps corresponding to player 2's states
    type: [Date],   // Stays as Array of Dates
    required: true,
    default: [Date.now()],   // Default to empty array
  },
  // --- END MODIFIED FIELDS ---
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


export default mongoose.models.Game || mongoose.model('Game', GameSchema);