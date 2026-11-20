// server/src/controllers/me.controller.js
import User from '../models/User.js';
import Order from '../models/Order.js';
import SupportTicket from '../models/SupportTicket.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

const ADDRESS_LIMIT = 5;

/**
 * Get all addresses of current user
 */
export async function getAddresses(req, res) {
  res.json(req.user.addresses || []);
}

/**
 * Add a new address
 */
export async function createAddress(req, res, next) {
  try {
    const { label, line, landmark = '', lat, lng, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (user.addresses.length >= ADDRESS_LIMIT) {
      throw new HttpError(400, CODES.ADDRESS_LIMIT, null, `Maximum ${ADDRESS_LIMIT} addresses allowed`);
    }

    const shouldBeDefault = isDefault || user.addresses.length === 0;

    if (shouldBeDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      label,
      line,
      landmark,
      lat,
      lng,
      isDefault: shouldBeDefault
    });

    await user.save();
    const created = user.addresses[user.addresses.length - 1];
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing address
 */
export async function updateAddress(req, res, next) {
  try {
    const { id } = req.params;
    const { label, line, landmark, lat, lng, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    const addr = user.addresses.id(id);
    if (!addr) {
      throw new HttpError(404, CODES.NOT_FOUND, null, 'Address not found');
    }

    if (label !== undefined) addr.label = label;
    if (line !== undefined) addr.line = line;
    if (landmark !== undefined) addr.landmark = landmark;
    if (lat !== undefined) addr.lat = lat;
    if (lng !== undefined) addr.lng = lng;

    if (isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = a._id.toString() === id;
      });
    }

    await user.save();
    res.json(addr);
  } catch (err) {
    next(err);
  }
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const addr = user.addresses.id(id);
    if (!addr) {
      throw new HttpError(404, CODES.NOT_FOUND, null, 'Address not found');
    }

    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === id;
    });

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete an address
 */
export async function deleteAddress(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const addr = user.addresses.id(id);
    if (!addr) {
      throw new HttpError(404, CODES.NOT_FOUND, null, 'Address not found');
    }

    const wasDefault = addr.isDefault;
    user.addresses.pull({ _id: id });

    // If was default and remaining addresses exist, make newest (last) the default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[user.addresses.length - 1].isDefault = true;
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
}

/**
 * Get notification/action badges for current user
 */
export async function getBadges(req, res, next) {
  try {
    const user = req.user;
    const badges = {};

    if (user.role === 'customer') {
      const activeStatuses = ['PLACED', 'ACCEPTED', 'PACKED', 'PICKED_UP'];
      const [activeOrders, unreadTickets] = await Promise.all([
        Order.countDocuments({ customer: user._id, status: { $in: activeStatuses } }),
        SupportTicket.countDocuments({ customer: user._id, status: { $in: ['OPEN', 'IN_PROGRESS'] } })
      ]);
      badges.activeOrders = activeOrders;
      badges.unreadTickets = unreadTickets;
    } else if (user.role === 'seller' && req.sellerProfile) {
      const [newOrders, unreadTickets] = await Promise.all([
        Order.countDocuments({ seller: req.sellerProfile._id, status: 'PLACED' }),
        SupportTicket.countDocuments({ seller: req.sellerProfile._id, status: { $in: ['OPEN', 'IN_PROGRESS'] } })
      ]);
      badges.newOrders = newOrders;
      badges.unreadTickets = unreadTickets;
    } else if (user.role === 'partner' && req.partnerProfile) {
      const [availableJobs, activeOrder] = await Promise.all([
        Order.countDocuments({ status: 'PACKED', partner: null }),
        Order.findOne({ partner: req.partnerProfile._id, status: { $in: ['ACCEPTED', 'PACKED', 'PICKED_UP'] } })
      ]);
      badges.availableJobs = availableJobs;
      badges.hasActive = !!activeOrder;
    }

    res.json(badges);
  } catch (err) {
    next(err);
  }
}
