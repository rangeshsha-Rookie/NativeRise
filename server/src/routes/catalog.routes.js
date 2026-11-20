// server/src/routes/catalog.routes.js
import { Router } from 'express';
import {
  getHomeData,
  getCategories,
  getSearchSuggestions,
  getProducts,
  getTrendingProducts,
  getProductById,
  getProductReviews,
  getSellers,
  getSellerById,
  getSellerProducts
} from '../controllers/catalog.controller.js';

const router = Router();

router.get('/home', getHomeData);
router.get('/categories', getCategories);
router.get('/search/suggest', getSearchSuggestions);
router.get('/products', getProducts);
router.get('/products/trending', getTrendingProducts);
router.get('/products/:id', getProductById);
router.get('/products/:id/reviews', getProductReviews);
router.get('/sellers', getSellers);
router.get('/sellers/:id', getSellerById);
router.get('/sellers/:id/products', getSellerProducts);

export default router;
