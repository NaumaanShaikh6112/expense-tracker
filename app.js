import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser'; 
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import configuration and routes
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js'; // Keep this as it handles /dashboard
import registerRoutes from './routes/registerRoutes.js';
import homeRoutes from './routes/home.js';

// Import utilities
import sendEmail from './utils/sendEmail.js';

dotenv.config(); // Load environment variables

const app = express();

// Get the current directory path using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(express.json()); // For parsing JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // For parsing URL-encoded data
app.use(cookieParser()); // For parsing cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Set up EJS for views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);  // Handle /expenses/dashboard in expenseRoutes
app.use('/register', registerRoutes);
app.use('/', homeRoutes);

// Example usage of sendEmail (for testing)
app.get('/send-test-email', async (req, res) => {
  try {
    await sendEmail('recipient@example.com', 'Test Subject', 'This is a test email');
    res.send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
