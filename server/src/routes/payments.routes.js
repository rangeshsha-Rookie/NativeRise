// server/src/routes/payments.routes.js
import { Router } from 'express';
import { handleWebhook } from '../controllers/payments.controller.js';

const router = Router();

// Webhook endpoint (public)
router.post('/webhook', handleWebhook);

export default router;
