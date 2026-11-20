// server/src/routes/assistant.routes.js
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { chat } from '../controllers/assistant.controller.js';

const router = Router();

// Assistant chat endpoint for customer and seller
router.post('/chat', requireAuth, chat);

export default router;
