import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Assuming User model is available

export default async function authMiddleware(req, res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the userId to the request object
    req.user = await User.findById(decoded.userId); // Find user by ID from the token

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}
