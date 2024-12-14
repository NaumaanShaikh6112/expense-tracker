import express from 'express';
const router = express.Router();

// Home route to render the welcome page
router.get('/', (req, res) => {
  res.render('home'); // Render home.ejs file
});

export default router;
