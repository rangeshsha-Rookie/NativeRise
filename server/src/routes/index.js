// server/src/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import meRoutes from './me.routes.js';
import geoRoutes from './geo.routes.js';
import catalogRoutes from './catalog.routes.js';
import cartRoutes from './cart.routes.js';
import ordersRoutes from './orders.routes.js';
import paymentsRoutes from './payments.routes.js';
import reviewsRoutes from './reviews.routes.js';
import supportRoutes from './support.routes.js';
import assistantRoutes from './assistant.routes.js';
import sellerRoutes from './seller.routes.js';
import partnerRoutes from './partner.routes.js';
import aiRoutes from './ai.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    name: 'NativeRise API v1',
    status: 'online',
    endpoints: {
      health: '/api/v1/health',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      sellers: '/api/v1/sellers',
      auth: '/api/v1/auth',
      cart: '/api/v1/cart',
      orders: '/api/v1/orders'
    }
  });
});

router.use('/auth', authRoutes);
router.use('/me', meRoutes);
router.use('/geo', geoRoutes);
router.use('/catalog', catalogRoutes);
router.use('/', catalogRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', ordersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/support', supportRoutes);
router.use('/assistant', assistantRoutes);
router.use('/seller', sellerRoutes);
router.use('/partner', partnerRoutes);
router.use('/ai', aiRoutes);

export default router;
