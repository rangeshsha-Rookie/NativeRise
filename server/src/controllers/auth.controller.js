// server/src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import SellerProfile from '../models/SellerProfile.js';
import PartnerProfile from '../models/PartnerProfile.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';
import { ensureBilingual, hasDevanagari } from '../services/translate.service.js';

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

function toBilingualInput(val) {
  if (!val) return { en: '', mr: '' };
  if (typeof val === 'object' && (val.en || val.mr)) {
    return { en: val.en || '', mr: val.mr || '' };
  }
  const str = String(val).trim();
  return hasDevanagari(str) ? { en: '', mr: str } : { en: str, mr: '' };
}

/**
 * Register a new user (customer, seller, or partner)
 */
export async function register(req, res, next) {
  try {
    const { role, name, email, phone, password, preferredLang = 'en', shop, partner } = req.body;

    const normalizedEmail = (email || '').toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new HttpError(409, CODES.AUTH_EMAIL_TAKEN, { email: normalizedEmail }, 'Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Ensure bilingual name via transliteration
    const bilingualName = await ensureBilingual(toBilingualInput(name), 'transliterate');

    // Create User document
    const user = new User({
      role,
      name: { en: bilingualName.en, mr: bilingualName.mr },
      email: normalizedEmail,
      phone,
      passwordHash,
      preferredLang: preferredLang === 'mr' ? 'mr' : 'en',
      addresses: [],
      isDemo: false
    });

    let profile = null;

    if (role === 'seller') {
      if (!shop) {
        throw new HttpError(400, CODES.VALIDATION_FAILED, { shop: 'Required for seller' }, 'Shop details required');
      }

      const shopNameBilingual = await ensureBilingual(toBilingualInput(shop.shopName), 'transliterate');
      const villageBilingual = await ensureBilingual(toBilingualInput(shop.village), 'transliterate');
      const storyBilingual = await ensureBilingual(toBilingualInput(shop.story), 'translate');

      await user.save();

      try {
        profile = await SellerProfile.create({
          user: user._id,
          shopName: { en: shopNameBilingual.en, mr: shopNameBilingual.mr },
          story: { en: storyBilingual.en, mr: storyBilingual.mr },
          village: { en: villageBilingual.en, mr: villageBilingual.mr },
          district: shop.district,
          state: shop.state || 'Maharashtra',
          pincode: shop.pincode,
          location: shop.location,
          maxDeliveryKm: shop.maxDeliveryKm,
          prepTimeMins: shop.prepTimeMins,
          minOrderPaise: shop.minOrderPaise,
          deliveryMode: shop.deliveryMode || 'INCLUDED'
        });
      } catch (err) {
        await User.findByIdAndDelete(user._id);
        throw err;
      }
    } else if (role === 'partner') {
      if (!partner) {
        throw new HttpError(400, CODES.VALIDATION_FAILED, { partner: 'Required for partner' }, 'Partner details required');
      }

      await user.save();

      try {
        profile = await PartnerProfile.create({
          user: user._id,
          vehicleType: partner.vehicleType,
          vehicleNumber: partner.vehicleNumber || '',
          baseLocation: partner.baseLocation,
          serviceRadiusKm: partner.serviceRadiusKm
        });
      } catch (err) {
        await User.findByIdAndDelete(user._id);
        throw err;
      }
    } else {
      await user.save();
    }

    const token = signToken(user);
    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.status(201).json({
      token,
      user: userObj,
      profile
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login user
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      throw new HttpError(401, CODES.AUTH_INVALID_CREDENTIALS, null, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new HttpError(401, CODES.AUTH_INVALID_CREDENTIALS, null, 'Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save();

    let profile = null;
    if (user.role === 'seller') {
      profile = await SellerProfile.findOne({ user: user._id });
    } else if (user.role === 'partner') {
      profile = await PartnerProfile.findOne({ user: user._id });
    }

    const token = signToken(user);
    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({
      token,
      user: userObj,
      profile
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current authenticated user + profile
 */
export async function getMe(req, res) {
  const profile = req.sellerProfile || req.partnerProfile || null;
  res.json({
    user: req.user,
    profile
  });
}

/**
 * Update current user name or phone
 */
export async function updateMe(req, res, next) {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) {
      const bilingualName = await ensureBilingual(toBilingualInput(name), 'transliterate');
      user.name = { en: bilingualName.en, mr: bilingualName.mr };
    }
    if (phone) {
      user.phone = phone;
    }

    await user.save();
    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json(userObj);
  } catch (err) {
    next(err);
  }
}

/**
 * Update user language preference
 */
export async function updateLanguage(req, res, next) {
  try {
    const { lang } = req.body;
    const user = await User.findById(req.user._id);
    user.preferredLang = lang === 'mr' ? 'mr' : 'en';
    await user.save();

    res.json({ preferredLang: user.preferredLang });
  } catch (err) {
    next(err);
  }
}

/**
 * Update user password
 */
export async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+passwordHash');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new HttpError(400, CODES.AUTH_INVALID_CREDENTIALS, null, 'Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
