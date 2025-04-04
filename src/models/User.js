// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this user.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  // Add other fields as needed, e.g.:
  // email: {
  //   type: String,
  //   required: [true, 'Please provide an email for this user.'],
  //   unique: true,
  //   match: [/.+@.+\..+/, 'Please provide a valid email address'],
  // },
  // createdAt: {
  //   type: Date,
  //   default: Date.now,
  // },
});

// Prevent model overwrite during hot-reloading
export default mongoose.models.User || mongoose.model('User', UserSchema);