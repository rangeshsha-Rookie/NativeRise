// server/src/middleware/validate.js
import { normalizeDigits } from '../utils/digits.js';
import { HttpError } from '../utils/httpError.js';
import { ErrorCodes } from '../utils/codes.js';

const TARGET_NORMALIZATION_FIELDS = [
  'phone',
  'pincode',
  'code',
  'stock',
  'qty',
  'quantityValue',
  'priceRupees',
  'pricePaise',
  'minPrice',
  'maxPrice',
  'minOrderPaise',
  'expectedTotalPaise',
  'amountPaise'
];

function shouldNormalizeField(key) {
  if (TARGET_NORMALIZATION_FIELDS.includes(key)) return true;
  if (key.startsWith('price') || key.endsWith('Paise') || key.endsWith('Rupees')) return true;
  return false;
}

function recursiveNormalize(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(recursiveNormalize);
  }

  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string' && shouldNormalizeField(key)) {
      result[key] = normalizeDigits(val);
    } else if (typeof val === 'object' && val !== null) {
      result[key] = recursiveNormalize(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export function validate({ body, query, params }) {
  return (req, res, next) => {
    try {
      if (body) {
        req.body = recursiveNormalize(req.body);
        const parsedBody = body.strict().parse(req.body);
        req.body = parsedBody;
      }
      if (query) {
        req.query = recursiveNormalize(req.query);
        const parsedQuery = query.strict().parse(req.query);
        req.query = parsedQuery;
      }
      if (params) {
        req.params = recursiveNormalize(req.params);
        const parsedParams = params.strict().parse(req.params);
        req.params = parsedParams;
      }
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const details = err.errors.map((e) => ({
          path: e.path.join('.'),
          code: e.code,
          message: e.message
        }));
        return next(new HttpError(400, ErrorCodes.VALIDATION_FAILED, details, 'Request validation failed'));
      }
      next(err);
    }
  };
}

export default validate;
