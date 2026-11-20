// server/src/routes/cart.routes.js
import { Router } from 'express';
import { z } from 'zod';
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartQuote
} from '../controllers/cart.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { MAX_CART_QTY_PER_ITEM } from '../config/constants.js';

const router = Router();

router.use(requireAuth, requireRole('customer'));

const updateCartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  qty: z.number().int().min(0).max(MAX_CART_QTY_PER_ITEM),
  replace: z.boolean().optional()
});

router.get('/', getCart);
router.put('/items', validate({ body: updateCartItemSchema }), updateCartItem);
router.post('/items', validate({ body: updateCartItemSchema }), updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.delete('/', clearCart);
router.get('/quote', getCartQuote);

export default router;
