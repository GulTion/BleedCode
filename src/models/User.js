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
    // Password might not be required if using OAuth exclusively for some users
    // Consider conditional requirement or handling this in the auth logic
    required: [true, 'Please provide a password.'],
    minlength: [8, 'Password must be at least 8 characters'],
    // select: false, // Good practice to not select password by default
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
  emailVerified: { // Added for OAuth
    type: Date,
    default: null,
  },
  image: { // Added for OAuth profile picture
    type: String,
    default: null,
  },
  authProvider: { // Added to track signup method
    type: String,
    enum: ['credentials', 'google'], // Add other providers as needed
    default: 'credentials',
  },
  // lastLogin: Date,
});

// Optional: Add pre-save hook here for password hashing if needed
// Example: Hashing password only if it's modified and provider is 'credentials'
// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password') || this.authProvider !== 'credentials') return next();
//   // Hash password logic here (e.g., using bcrypt)
//   // const salt = await bcrypt.genSalt(10);
//   // this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

export default mongoose.models.User || mongoose.model('User', UserSchema);