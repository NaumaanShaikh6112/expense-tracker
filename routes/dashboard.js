// routes/dashboard.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js'; // Assuming User model stores the salary
import Expense from '../models/Expense.js';

const router = express.Router();

// Dashboard Route (Show user expenses and salary)
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const salary = user.salary || 0; // Default to 0 if no salary set

    // Get all expenses of the logged-in user
    const expenses = await Expense.find({ user: req.user.id });
    res.render('dashboard', { salary, expenses }); // Pass salary and expenses to the view
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
