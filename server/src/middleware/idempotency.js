// server/src/middleware/idempotency.js
import Idempotency from '../models/Idempotency.js';
import { HttpError } from '../utils/httpError.js';
import { ErrorCodes } from '../utils/codes.js';

export async function checkIdempotency(req, res, next) {
  const key = req.headers['idempotency-key'];
  if (!key) {
    return next(new HttpError(400, ErrorCodes.VALIDATION_FAILED, { field: 'Idempotency-Key' }, 'Idempotency-Key header is required'));
  }

  try {
    const existing = await Idempotency.findOne({ key, user: req.user._id });
    if (existing) {
      if (existing.responseBody) {
        return res.status(200).json(existing.responseBody);
      }
      return next(new HttpError(409, ErrorCodes.IDEMPOTENCY_CONFLICT, null, 'Request is currently being processed'));
    }

    req.idempotencyKey = key;
    next();
  } catch (err) {
    next(err);
  }
}

export default checkIdempotency;
