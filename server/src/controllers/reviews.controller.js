// server/src/controllers/reviews.controller.js
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import SellerProfile from '../models/SellerProfile.js';
import { ensureBilingual, hasDevanagari } from '../services/translate.service.js';
import { pick } from '../utils/pick.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

const AVAILABLE_THEMES = ['taste', 'quality', 'freshness', 'packaging', 'delivery', 'price', 'quantity', 'service'];

function detectThemes(text = '') {
  const lower = text.toLowerCase();
  const matched = [];
  if (lower.includes('taste') || lower.includes('चव') || lower.includes('स्वादिष्ट')) matched.push('taste');
  if (lower.includes('qualit') || lower.includes('दर्जा')) matched.push('quality');
  if (lower.includes('fresh') || lower.includes('ताजे') || lower.includes('ताजी')) matched.push('freshness');
  if (lower.includes('pack') || lower.includes('पॅकिंग')) matched.push('packaging');
  if (lower.includes('deliver') || lower.includes('पोहोच')) matched.push('delivery');
  if (lower.includes('price') || lower.includes('किंमत') || lower.includes('rate')) matched.push('price');
  if (lower.includes('quantit') || lower.includes('प्रमाण')) matched.push('quantity');
  if (lower.includes('service') || lower.includes('सेवा')) matched.push('service');
  return matched.filter((t) => AVAILABLE_THEMES.includes(t));
}

/**
 * POST /reviews
 * Customer posts a review for a product in a delivered order
 */
export async function createReview(req, res, next) {
  try {
    const { orderId, productId, rating, text } = req.body;

    if (!orderId || !productId || !rating) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'orderId, productId and rating are required');
    }

    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Rating must be an integer between 1 and 5');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      throw new HttpError(403, CODES.AUTH_FORBIDDEN, null, 'You can only review your own orders');
    }

    if (order.status !== 'DELIVERED') {
      throw new HttpError(400, CODES.ORDER_NOT_DELIVERED, null, 'Can only review products from delivered orders');
    }

    const itemExists = order.items.some(
      (it) => it.product?.toString() === productId.toString()
    );
    if (!itemExists) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Product does not belong to this order');
    }

    // Check duplicate
    const existing = await Review.findOne({ order: orderId, product: productId });
    if (existing) {
      throw new HttpError(409, CODES.REVIEW_DUPLICATE, null, 'You have already reviewed this product for this order');
    }

    // Sentiment based on rating
    let sentiment = 'neutral';
    if (numRating >= 4) sentiment = 'positive';
    else if (numRating <= 2) sentiment = 'negative';

    let bilingualText = { en: '', mr: '' };
    let themes = [];

    if (text && typeof text === 'string' && text.trim().length > 0) {
      const cleanText = text.trim().slice(0, 600);
      themes = detectThemes(cleanText);
      const isMr = hasDevanagari(cleanText);
      bilingualText = await ensureBilingual(
        isMr ? { en: '', mr: cleanText } : { en: cleanText, mr: '' },
        'translate'
      );
    }

    const review = await Review.create({
      order: order._id,
      product: productId,
      customer: req.user._id,
      seller: order.seller,
      rating: numRating,
      text: bilingualText,
      originalLang: req.lang || 'en',
      sentiment,
      themes
    });

    // Recompute product ratings
    const prodReviews = await Review.find({ product: productId }).lean();
    if (prodReviews.length > 0) {
      const prodAvg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(prodAvg * 10) / 10,
        reviewCount: prodReviews.length
      });
    }

    // Recompute seller ratings
    const sellerReviews = await Review.find({ seller: order.seller }).lean();
    if (sellerReviews.length > 0) {
      const sellerAvg = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
      await SellerProfile.findByIdAndUpdate(order.seller, {
        'rating.average': Math.round(sellerAvg * 10) / 10,
        'rating.count': sellerReviews.length
      });
    }

    res.status(201).json({
      id: review._id.toString(),
      orderId: review.order.toString(),
      productId: review.product.toString(),
      rating: review.rating,
      text: pick(review.text, req.lang),
      sentiment: review.sentiment,
      themes: review.themes,
      createdAt: review.createdAt
    });
  } catch (err) {
    next(err);
  }
}
