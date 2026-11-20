// server/src/routes/partner.routes.js
import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  toggleOnline,
  postLocation,
  getDashboard,
  getJobs,
  getActiveOrder,
  getOrderRoute,
  acceptOrder,
  releaseOrder,
  pickupOrder,
  deliverOrder,
  failOrder,
  getHistory,
  getEarnings,
  postCashDeposit
} from '../controllers/partner.controller.js';

const router = Router();

// All partner routes require authentication and partner role
router.use(requireAuth, requireRole('partner'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.patch('/online', toggleOnline);
router.post('/location', postLocation);
router.get('/dashboard', getDashboard);
router.get('/jobs', getJobs);
router.get('/active', getActiveOrder);

router.get('/orders/:id/route', getOrderRoute);
router.post('/orders/:id/accept', acceptOrder);
router.post('/orders/:id/release', releaseOrder);
router.post('/orders/:id/pickup', pickupOrder);
router.post('/orders/:id/deliver', deliverOrder);
router.post('/orders/:id/fail', failOrder);

router.get('/history', getHistory);
router.get('/earnings', getEarnings);
router.post('/cash-deposit', postCashDeposit);

export default router;
