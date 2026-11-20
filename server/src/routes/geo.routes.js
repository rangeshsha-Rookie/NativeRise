// server/src/routes/geo.routes.js
import { Router } from 'express';
import { z } from 'zod';
import { search, reverse, feasibility } from '../controllers/geo.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const searchSchema = z.object({
  q: z.string().optional().default(''),
  lang: z.enum(['en', 'mr']).optional()
});

const reverseSchema = z.object({
  lat: z.coerce.number().min(6).max(38),
  lng: z.coerce.number().min(68).max(98),
  lang: z.enum(['en', 'mr']).optional()
});

const feasibilitySchema = z
  .object({
    lat: z.coerce.number().min(6).max(38),
    lng: z.coerce.number().min(68).max(98),
    productId: z.string().optional(),
    sellerId: z.string().optional()
  })
  .refine((data) => data.productId || data.sellerId, {
    message: 'Either productId or sellerId must be provided'
  });

router.get('/search', validate({ query: searchSchema }), search);
router.get('/reverse', validate({ query: reverseSchema }), reverse);
router.get('/feasibility', validate({ query: feasibilitySchema }), feasibility);

export default router;
