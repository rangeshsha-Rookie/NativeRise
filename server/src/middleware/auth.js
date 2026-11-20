// server/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import SellerProfile from '../models/SellerProfile.js';
import PartnerProfile from '../models/PartnerProfile.js';
import { HttpError } from '../utils/httpError.js';
import { ErrorCodes } from '../utils/codes.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new HttpError(401, ErrorCodes.AUTH_REQUIRED, null, 'Authorization token required'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new HttpError(401, ErrorCodes.AUTH_TOKEN_EXPIRED, null, 'Token has expired'));
      }
      return next(new HttpError(401, ErrorCodes.AUTH_REQUIRED, null, 'Invalid token'));
    }

    const user = await User.findById(decoded.sub).select('-passwordHash');
    if (!user) {
      return next(new HttpError(401, ErrorCodes.AUTH_REQUIRED, null, 'User no longer exists'));
    }

    req.user = user;

    // Load role profile if seller or partner
    if (user.role === 'seller') {
      req.sellerProfile = await SellerProfile.findOne({ user: user._id });
    } else if (user.role === 'partner') {
      req.partnerProfile = await PartnerProfile.findOne({ user: user._id });
    }

    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new HttpError(401, ErrorCodes.AUTH_REQUIRED, null, 'Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new HttpError(403, ErrorCodes.FORBIDDEN_ROLE, null, 'Forbidden: insufficient role permissions'));
    }
    next();
  };
}

export default {
  requireAuth,
  requireRole
};
