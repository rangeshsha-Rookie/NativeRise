// server/src/routes/reviews.routes.js
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createReview } from '../controllers/reviews.controller.js';

const router = Router();

// POST /reviews is customer only
router.post('/', requireAuth, requireRole('customer'), createReview);

export default router;
