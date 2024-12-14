import express from 'express';
import Expense from '../models/Expense.js';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js'; // Assuming User model stores the salary

const router = express.Router();

// Dashboard - Show user expenses (Read)
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Fetch user salary (assuming it's stored in the User model)
    const user = await User.findById(req.user.id);
    const salary = user.salary || 0; // Default to 0 if no salary set

    // Get all expenses of the logged-in user
    const expenses = await Expense.find({ user: req.user.id });
    res.render('dashboard', { salary, expenses });  // Pass salary and expenses to the view
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add Expense (Protected Route)
router.post('/add-expense', authMiddleware, async (req, res) => {
  const { description, amount } = req.body;

  try {
    const expense = new Expense({
      user: req.user.id, // Use the user's ID from the authMiddleware
      description,
      amount,
    });
    await expense.save();
    res.redirect('/expenses/dashboard');  // Redirect to dashboard after saving
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Expense (GET /expenses/expense/delete/:id)
router.get("/expense/delete/:id", authMiddleware, async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.redirect("/expenses/dashboard");  // Redirect to dashboard after deleting
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
