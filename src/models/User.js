import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this user.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    maxlength: [40, 'Username cannot be more than 40 characters'],
    unique: true, // Ensure usernames are unique
    trim: true,
    index: true, // Add index for faster username lookups
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: [8, 'Password must be at least 8 characters'],
    // IMPORTANT: Remember to HASH passwords before saving using libraries like bcrypt
    // Do NOT store plain text passwords. Mongoose 'select: false' can hide it by default
    // select: false,
  },
  rating: {
    type: Number,
    required: true,
    default: 1500, // Example starting rating (like ELO)
    min: 0,
  },
  wins: {
    type: Number,
    required: true,
    default: 0, 
    min: 0,
  },
  losses: {
    type: Number,
    required: true,
    default: 0, 
    min: 0,
  },
  coins: {
    type: Number,
    required: true,
    default: 100, // Example starting rating (like ELO)
    min: 0,
  },
  numberOfFriends: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+@.+\..+/, 'Please provide a valid email address'],
    trim: true,
  },
  // lastLogin: Date,
});

// Optional: Add pre-save hook here for password hashing if needed

// Prevent model overwrite during hot-reloading
export default mongoose.models.User || mongoose.model('User', UserSchema);