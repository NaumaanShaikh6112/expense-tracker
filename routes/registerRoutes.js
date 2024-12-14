// routes/register.js
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// Registration Route
router.get('/register', (req, res) => {
  res.render('register', { error: null, success: null });
});

router.post('/register', async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;

  // Validation
  if (password !== passwordConfirm) {
    return res.render('register', { error: 'Passwords do not match.', success: null });
  }

  try {
    // Check if the email is already registered
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.render('register', { error: 'Email already in use.', success: null });
    }

    // Hash the password and save the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.render('login', { error: null, success: 'Registration successful! You can now log in.' });
  } catch (err) {
    console.error('Error during registration:', err); // Add more detailed logging
    res.status(500).render('register', { error: 'Something went wrong. Please try again later.', success: null });
  }
});

export default router;
