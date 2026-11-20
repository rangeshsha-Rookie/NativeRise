// server/src/routes/auth.routes.js
import { Router } from 'express';
import { z } from 'zod';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  role: z.enum(['customer', 'seller', 'partner']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a 10-digit Indian phone number starting with 6-9'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least 1 letter and 1 number'),
  preferredLang: z.enum(['en', 'mr']).optional(),
  shop: z
    .object({
      shopName: z.string().min(2),
      story: z.string().min(40, 'Story must be at least 40 characters').max(600, 'Story must not exceed 600 characters'),
      village: z.string().min(2),
      district: z.string().min(2),
      pincode: z.string().regex(/^\d{6}$/, 'Must be 6 digits'),
      location: z.object({
        lat: z.number().min(6).max(38),
        lng: z.number().min(68).max(98),
        line: z.string().min(3)
      }),
      maxDeliveryKm: z.number().min(3).max(100).default(30),
      prepTimeMins: z.number().min(15).max(1440).default(60),
      minOrderPaise: z.number().int().min(0).default(0),
      deliveryMode: z.enum(['INCLUDED', 'CUSTOMER_PAYS']).default('INCLUDED')
    })
    .optional(),
  partner: z
    .object({
      vehicleType: z.enum(['BIKE', 'CYCLE', 'ON_FOOT', 'AUTO']),
      vehicleNumber: z.string().optional(),
      baseLocation: z.object({
        lat: z.number().min(6).max(38),
        lng: z.number().min(68).max(98),
        line: z.string().min(3)
      }),
      serviceRadiusKm: z.number().min(3).max(60).default(30)
    })
    .optional()
});

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required')
});

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);
router.get('/me', requireAuth, getMe);

export default router;
