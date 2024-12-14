import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // Fields for password reset functionality
  resetPasswordToken: String,  // For storing the reset token
  resetPasswordExpires: Date   // For storing the expiration date of the token
});

const User = mongoose.model('User', userSchema);

export default User;
