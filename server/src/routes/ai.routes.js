// server/src/routes/ai.routes.js
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';
import { chat } from '../controllers/assistant.controller.js';
import {
  postWhatToSell,
  postSnapAndSell,
  postVoiceToListing,
  postDescribe,
  getGrowthCoach,
  postDraftReply
} from '../controllers/ai.controller.js';

const router = Router();

// Customer/General Assistant endpoint accessible under /ai/assistant
router.post('/assistant', chat);
router.post('/assistant/chat', chat);

// Seller AI features require seller role
router.use(requireAuth, requireRole('seller'));

router.post('/what-to-sell', postWhatToSell);
router.get('/what-to-sell', postWhatToSell);
router.post('/snap-and-sell', uploadSingleImage('image'), postSnapAndSell);
router.post('/voice-to-listing', postVoiceToListing);
router.post('/describe', postDescribe);
router.get('/growth-coach', getGrowthCoach);
router.post('/support/draft-reply', postDraftReply);

export default router;
