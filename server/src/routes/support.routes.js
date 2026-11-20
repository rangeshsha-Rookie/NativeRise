// server/src/routes/support.routes.js
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createTicket,
  getCustomerTickets,
  getCustomerTicketById,
  replyCustomerTicket
} from '../controllers/support.controller.js';

const router = Router();

// Customer support ticket routes
router.use(requireAuth, requireRole('customer'));

router.post('/tickets', createTicket);
router.get('/tickets', getCustomerTickets);
router.get('/tickets/:id', getCustomerTicketById);
router.post('/tickets/:id/messages', replyCustomerTicket);

export default router;
