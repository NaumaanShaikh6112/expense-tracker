import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import crypto from "crypto";
import Expense from "../models/Expense.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

// Login Page - Display login form
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Invalid email
      return res.render("login", { error: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Invalid password
      return res.render("login", { error: "Invalid Password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.redirect("/expenses/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Register Route - User registration
router.get("/register", (req, res) => {
  res.render("register");
});
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Redirect with success query parameter
    res.redirect("/auth/login?success=true"); // Pass success flag as query parameter
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Dashboard Route - Render user dashboard (protected route)
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const salary = user.salary || 0;

    const expenses = await Expense.find({ user: req.user.id });
    const remainingAmount =
      salary - expenses.reduce((total, expense) => total + expense.amount, 0);

    res.render("dashboard", { salary, expenses, remainingAmount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Forgot Password Route
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", {
    error: null,
    success: null,
  });
});

// Handle Forgot Password Form Submission
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("forgot-password", {
        error: "No account with that email address exists.",
        success: null,
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/auth/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      `To reset your password, click on the following link: ${resetUrl}`
    );

    res.render("forgot-password", {
      error: null,
      success: "A password reset link has been sent to your email.",
    });
  } catch (err) {
    console.error(err);
    res.render("forgot-password", {
      error: "Something went wrong. Please try again later.",
      success: null,
    });
  }
});

// Reset Password Page (GET /auth/reset-password/:token)
router.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token has not expired
    });

    if (!user) {
      return res.send("Password reset token is invalid or has expired.");
    }

    // Render the reset password page, passing the token
    res.render("reset-password", { token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Handle Reset Password (POST /auth/reset-password/:token)
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send("Passwords do not match.");
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token has not expired
    });

    if (!user) {
      return res.send("Password reset token is invalid or has expired.");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear the reset token and expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.send("Your password has been reset. You can now log in.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Logout Route - User logout
router.get("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.redirect("/auth/login");
});

export default router;
