// server/src/controllers/geo.controller.js
import Product from '../models/Product.js';
import SellerProfile from '../models/SellerProfile.js';
import { searchAddress, reverseGeocode, checkFeasibility } from '../services/geo.service.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

/**
 * Address autocomplete search via Nominatim
 */
export async function search(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const lang = req.query.lang === 'mr' ? 'mr' : 'en';

    if (!q) {
      return res.json([]);
    }

    try {
      const results = await searchAddress(q, lang);
      res.json(results);
    } catch {
      throw new HttpError(502, CODES.GEOCODE_FAILED, null, 'Geocoding search failed');
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Reverse geocode coordinates via Nominatim
 */
export async function reverse(req, res, next) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const lang = req.query.lang === 'mr' ? 'mr' : 'en';

    if (isNaN(lat) || isNaN(lng)) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, { coords: 'Valid lat and lng required' }, 'Coordinates required');
    }

    try {
      const result = await reverseGeocode(lat, lng, lang);
      res.json(result);
    } catch {
      throw new HttpError(502, CODES.GEOCODE_FAILED, null, 'Reverse geocoding failed');
    }
  } catch (err) {
    next(err);
  }
}

/**
 * Check delivery feasibility from seller to customer coordinates
 */
export async function feasibility(req, res, next) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const { productId, sellerId } = req.query;

    if (isNaN(lat) || isNaN(lng)) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, { coords: 'Valid lat and lng required' }, 'Coordinates required');
    }

    let seller = null;
    if (sellerId) {
      seller = await SellerProfile.findById(sellerId);
    } else if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        seller = await SellerProfile.findById(product.seller);
      }
    }

    if (!seller) {
      throw new HttpError(404, CODES.NOT_FOUND, null, 'Seller or product not found');
    }

    const result = await checkFeasibility(seller, { lat, lng });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
