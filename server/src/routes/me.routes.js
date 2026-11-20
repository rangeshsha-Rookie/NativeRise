// server/src/routes/me.routes.js
import { Router } from 'express';
import { z } from 'zod';
import {
  getAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  getBadges
} from '../controllers/me.controller.js';
import { updateMe, updateLanguage, updatePassword } from '../controllers/auth.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// All routes under /me require authentication
router.use(requireAuth);

const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional()
});

const updateLangSchema = z.object({
  lang: z.enum(['en', 'mr'])
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/)
});

const addressSchema = z.object({
  label: z.string().min(1),
  line: z.string().min(3),
  landmark: z.string().optional(),
  lat: z.number().min(6).max(38),
  lng: z.number().min(68).max(98),
  isDefault: z.boolean().optional()
});

const updateAddressSchema = addressSchema.partial();

// Profile updates
router.patch('/', validate({ body: updateMeSchema }), updateMe);
router.patch('/language', validate({ body: updateLangSchema }), updateLanguage);
router.patch('/password', validate({ body: updatePasswordSchema }), updatePassword);
router.get('/badges', getBadges);

// Addresses (Customer only)
router.get('/addresses', requireRole('customer'), getAddresses);
router.post('/addresses', requireRole('customer'), validate({ body: addressSchema }), createAddress);
router.patch('/addresses/:id', requireRole('customer'), validate({ body: updateAddressSchema }), updateAddress);
router.patch('/addresses/:id/default', requireRole('customer'), setDefaultAddress);
router.delete('/addresses/:id', requireRole('customer'), deleteAddress);

export default router;
