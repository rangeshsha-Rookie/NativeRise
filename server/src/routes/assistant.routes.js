// server/src/routes/assistant.routes.js
import { Router } from 'express';
import { chat } from '../controllers/assistant.controller.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

const router = Router();

// Optional auth middleware so guests, customers, sellers, and partners can use the assistant
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.user = await User.findById(decoded.sub).select('-passwordHash');
    }
  } catch {
    // Ignore invalid token, proceed as guest
  }
  next();
};

// Assistant chat endpoints for all roles and guests
router.post('/chat', optionalAuth, chat);
router.post('/', optionalAuth, chat);

export default router;
