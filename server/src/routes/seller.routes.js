// server/src/routes/seller.routes.js
import { Router } from 'express';
import { z } from 'zod';
import {
  getShop,
  updateShop,
  uploadImage,
  getDashboard,
  getSellerProducts,
  createProduct,
  getProductById,
  updateProduct,
  updateStock,
  updateProductStatus,
  archiveProduct,
  getSellerOrders,
  getSellerOrderById,
  acceptOrder,
  rejectOrder,
  packOrder,
  getEarnings,
  getSellerReviews,
  getSellerTickets,
  getSellerTicketById,
  replyTicket,
  updateTicketStatus
} from '../controllers/seller.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth, requireRole('seller'));

// Shop & Profile
router.get('/shop', getShop);
router.put('/shop', updateShop);
router.post('/upload/image', uploadSingleImage, uploadImage);
router.get('/dashboard', getDashboard);

// Products
const productSchema = z.object({
  category: z.string().min(1),
  name: z.union([z.string().min(3), z.object({ en: z.string().optional(), mr: z.string().optional() })]),
  description: z.union([z.string().min(20), z.object({ en: z.string().optional(), mr: z.string().optional() })]),
  pricePaise: z.number().int().min(1000),
  quantityValue: z.number().min(0.001),
  quantityUnit: z.string().min(1),
  stock: z.number().int().min(0),
  images: z.array(z.string()).optional(),
  searchKeywords: z.array(z.string()).optional()
});

router.get('/products', getSellerProducts);
router.post('/products', validate({ body: productSchema }), createProduct);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.patch('/products/:id/stock', validate({ body: z.object({ stock: z.coerce.number().int().min(0) }) }), updateStock);
router.patch('/products/:id/status', validate({ body: z.object({ status: z.enum(['ACTIVE', 'PAUSED']) }) }), updateProductStatus);
router.delete('/products/:id', archiveProduct);

// Orders
router.get('/orders', getSellerOrders);
router.get('/orders/:id', getSellerOrderById);
router.post('/orders/:id/accept', acceptOrder);
router.post('/orders/:id/reject', validate({ body: z.object({ reason: z.string().optional() }) }), rejectOrder);
router.post('/orders/:id/pack', packOrder);

// Earnings & Reviews
router.get('/earnings', getEarnings);
router.get('/reviews', getSellerReviews);

// Support Tickets
router.get('/support/tickets', getSellerTickets);
router.get('/support/tickets/:id', getSellerTicketById);
router.post('/support/tickets/:id/messages', validate({ body: z.object({ text: z.string().min(1) }) }), replyTicket);
router.patch('/support/tickets/:id/status', validate({ body: z.object({ status: z.enum(['IN_PROGRESS', 'RESOLVED']) }) }), updateTicketStatus);

export default router;
