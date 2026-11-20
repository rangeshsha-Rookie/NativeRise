// server/src/routes/ai.routes.js
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';
import {
  postWhatToSell,
  postSnapAndSell,
  postVoiceToListing,
  postDescribe,
  getGrowthCoach,
  postDraftReply
} from '../controllers/ai.controller.js';

const router = Router();

// All AI features are for seller
router.use(requireAuth, requireRole('seller'));

router.post('/what-to-sell', postWhatToSell);
router.get('/what-to-sell', postWhatToSell);
router.post('/snap-and-sell', uploadSingleImage('image'), postSnapAndSell);
router.post('/voice-to-listing', postVoiceToListing);
router.post('/describe', postDescribe);
router.get('/growth-coach', getGrowthCoach);
router.post('/support/draft-reply', postDraftReply);

export default router;
