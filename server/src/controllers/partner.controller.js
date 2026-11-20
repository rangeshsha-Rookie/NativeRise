// server/src/controllers/partner.controller.js
import PartnerProfile from '../models/PartnerProfile.js';
import Order from '../models/Order.js';
import LedgerEntry from '../models/LedgerEntry.js';
import { transition } from '../services/orders.service.js';
import { updatePartnerLocation } from '../services/tracking.service.js';
import { getPartnerEarnings } from '../services/ledger.service.js';
import { haversineKm, roadDistanceKm } from '../services/geo.service.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { pick } from '../utils/pick.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

export function formatPartnerOrder(order, lang = 'en') {
  const o = order.toObject ? order.toObject() : order;
  return {
    id: o._id.toString(),
    orderNo: o.orderNo,
    status: o.status,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    seller: o.seller
      ? {
          id: o.seller._id ? o.seller._id.toString() : o.seller.toString(),
          shopName: o.seller.shopName ? pick(o.seller.shopName, lang) : ''
        }
      : null,
    pickup: o.pickup,
    address: o.address,
    items: (o.items || []).map((it) => ({
      name: it.name ? pick(it.name, lang) : '',
      image: it.image || '',
      qty: it.qty,
      quantityValue: it.quantityValue,
      quantityUnit: it.quantityUnit
    })),
    amounts: {
      itemsTotalPaise: o.itemsTotalPaise,
      totalPayablePaise: o.totalPayablePaise,
      partnerPayoutPaise: o.partnerPayoutPaise,
      collectAmountPaise: o.paymentMethod === 'COD' ? o.totalPayablePaise : 0
    },
    paymentMethod: o.paymentMethod,
    roadDistanceKm: o.roadDistanceKm,
    etaMins: o.etaMins,
    liveLocation: o.liveLocation,
    milestones: o.milestones,
    trail: o.trail || []
  };
}

/**
 * GET /partner/profile
 */
export async function getProfile(req, res, next) {
  try {
    const profile = await PartnerProfile.findOne({ user: req.user._id });
    if (!profile) {
      throw new HttpError(404, CODES.PARTNER_NOT_FOUND, null, 'Partner profile not found');
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /partner/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const profile = await PartnerProfile.findOne({ user: req.user._id });
    if (!profile) {
      throw new HttpError(404, CODES.PARTNER_NOT_FOUND, null, 'Partner profile not found');
    }

    const { vehicleType, vehicleNumber, baseLocation, serviceRadiusKm } = req.body;

    if (vehicleType) {
      if (!['BIKE', 'CYCLE', 'ON_FOOT', 'AUTO'].includes(vehicleType)) {
        throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Invalid vehicle type');
      }
      profile.vehicleType = vehicleType;
    }

    if (vehicleNumber !== undefined) {
      profile.vehicleNumber = vehicleNumber.toUpperCase().trim();
    }

    if (serviceRadiusKm !== undefined) {
      if (serviceRadiusKm < 3 || serviceRadiusKm > 60) {
        throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Radius must be between 3 and 60 km');
      }
      profile.serviceRadiusKm = serviceRadiusKm;
    }

    if (baseLocation) {
      if (baseLocation.lat === undefined || baseLocation.lng === undefined || !baseLocation.line) {
        throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Invalid base location');
      }
      profile.baseLocation = baseLocation;
    }

    await profile.save();
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /partner/online
 */
export async function toggleOnline(req, res, next) {
  try {
    const profile = await PartnerProfile.findOne({ user: req.user._id });
    if (!profile) {
      throw new HttpError(404, CODES.PARTNER_NOT_FOUND, null, 'Partner profile not found');
    }

    const { isOnline, lat, lng, accuracy } = req.body;

    if (isOnline) {
      if (lat === undefined || lng === undefined) {
        throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Fresh GPS location (lat, lng) is required to go online');
      }
      profile.isOnline = true;
      profile.lastLocation = {
        lat: Number(lat),
        lng: Number(lng),
        accuracy: accuracy ? Number(accuracy) : 10,
        at: new Date()
      };
    } else {
      if (profile.activeOrder) {
        throw new HttpError(400, CODES.PARTNER_BUSY, null, 'Cannot go offline with an active delivery in progress');
      }
      profile.isOnline = false;
    }

    await profile.save();
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /partner/location
 * Heartbeat every 10s
 */
export async function postLocation(req, res, next) {
  try {
    const { lat, lng, accuracy, simulated } = req.body;
    if (lat === undefined || lng === undefined) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'lat and lng are required');
    }

    const result = await updatePartnerLocation({
      partnerUser: req.user,
      lat: Number(lat),
      lng: Number(lng),
      accuracy: accuracy !== undefined ? Number(accuracy) : 10,
      simulated: !!simulated
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /partner/dashboard
 */
export async function getDashboard(req, res, next) {
  try {
    const profile = await PartnerProfile.findOne({ user: req.user._id });
    if (!profile) {
      throw new HttpError(404, CODES.PARTNER_NOT_FOUND, null, 'Partner profile not found');
    }

    // Start of today in IST (UTC + 5:30)
    const nowUtc = new Date();
    const istTime = new Date(nowUtc.getTime() + 5.5 * 3600 * 1000);
    istTime.setUTCHours(0, 0, 0, 0);
    const startOfTodayUtc = new Date(istTime.getTime() - 5.5 * 3600 * 1000);

    const [deliveredToday, earningsTodayRes, earningsTotalRes, allCodCollected, allCodDeposited] =
      await Promise.all([
        Order.countDocuments({
          partner: req.user._id,
          status: 'DELIVERED',
          deliveredAt: { $gte: startOfTodayUtc }
        }),
        LedgerEntry.aggregate([
          {
            $match: {
              user: req.user._id,
              role: 'partner',
              type: 'PARTNER_EARNING',
              createdAt: { $gte: startOfTodayUtc }
            }
          },
          { $group: { _id: null, total: { $sum: '$amountPaise' } } }
        ]),
        LedgerEntry.aggregate([
          {
            $match: {
              user: req.user._id,
              role: 'partner',
              type: 'PARTNER_EARNING'
            }
          },
          { $group: { _id: null, total: { $sum: '$amountPaise' } } }
        ]),
        LedgerEntry.aggregate([
          {
            $match: {
              user: req.user._id,
              role: 'partner',
              type: 'COD_CASH_COLLECTED'
            }
          },
          { $group: { _id: null, total: { $sum: '$amountPaise' } } }
        ]),
        LedgerEntry.aggregate([
          {
            $match: {
              user: req.user._id,
              role: 'partner',
              type: 'COD_CASH_DEPOSITED'
            }
          },
          { $group: { _id: null, total: { $sum: '$amountPaise' } } }
        ])
      ]);

    const earningsTodayPaise = earningsTodayRes[0]?.total || 0;
    const earningsTotalPaise = earningsTotalRes[0]?.total || 0;
    const codCollected = allCodCollected[0]?.total || 0;
    const codDeposited = allCodDeposited[0]?.total || 0;
    const cashToDepositPaise = Math.max(0, codCollected - codDeposited);

    res.json({
      isOnline: profile.isOnline,
      activeOrderId: profile.activeOrder ? profile.activeOrder.toString() : null,
      deliveredToday,
      earningsTodayPaise,
      earningsTotalPaise,
      cashToDepositPaise
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /partner/jobs
 */
export async function getJobs(req, res, next) {
  try {
    const profile = await PartnerProfile.findOne({ user: req.user._id });
    if (!profile) {
      throw new HttpError(404, CODES.PARTNER_NOT_FOUND, null, 'Partner profile not found');
    }

    if (!profile.isOnline) {
      throw new HttpError(400, CODES.PARTNER_OFFLINE, null, 'Must be online to view available jobs');
    }

    const partnerLoc = profile.lastLocation?.lat
      ? profile.lastLocation
      : profile.baseLocation;

    if (!partnerLoc || !partnerLoc.lat) {
      return res.json({ jobs: [] });
    }

    const availableOrders = await Order.find({
      status: 'PACKED',
      partner: null
    })
      .populate('seller', 'shopName location')
      .lean();

    const jobs = [];
    for (const order of availableOrders) {
      if (!order.pickup || order.pickup.lat === undefined) continue;

      const distToPickupKm = haversineKm(
        partnerLoc.lat,
        partnerLoc.lng,
        order.pickup.lat,
        order.pickup.lng
      );

      if (distToPickupKm <= profile.serviceRadiusKm) {
        jobs.push({
          id: order._id.toString(),
          orderNo: order.orderNo,
          shopName: order.seller ? pick(order.seller.shopName, req.lang) : '',
          pickup: order.pickup,
          drop: order.address,
          itemsCount: (order.items || []).reduce((sum, it) => sum + it.qty, 0),
          paymentMethod: order.paymentMethod,
          collectAmountPaise: order.paymentMethod === 'COD' ? order.totalPayablePaise : 0,
          payoutPaise: order.partnerPayoutPaise,
          roadDistanceKm: order.roadDistanceKm,
          distanceToPickupKm: Math.round(distToPickupKm * 10) / 10
        });
      }
    }

    jobs.sort((a, b) => a.distanceToPickupKm - b.distanceToPickupKm);

    res.json({ jobs });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /partner/active
 */
export async function getActiveOrder(req, res, next) {
  try {
    const profile = await PartnerProfile.findOne({ user: req.user._id });
    if (!profile) {
      throw new HttpError(404, CODES.PARTNER_NOT_FOUND, null, 'Partner profile not found');
    }

    let activeOrder = null;
    if (profile.activeOrder) {
      activeOrder = await Order.findOne({
        _id: profile.activeOrder,
        partner: req.user._id,
        status: { $in: ['ASSIGNED', 'PICKED_UP'] }
      })
        .select('-deliveryCode')
        .populate('seller', 'shopName')
        .lean();
    }
    if (!activeOrder) {
      activeOrder = await Order.findOne({
        partner: req.user._id,
        status: { $in: ['ASSIGNED', 'PICKED_UP'] }
      })
        .sort({ updatedAt: -1 })
        .select('-deliveryCode')
        .populate('seller', 'shopName')
        .lean();
    }

    if (!activeOrder) {
      return res.json({ order: null });
    }

    res.json({ order: formatPartnerOrder(activeOrder, req.lang) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /partner/orders/:id/route
 */
export async function getOrderRoute(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    if (!order.pickup || !order.address) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Order missing pickup or drop coordinates');
    }

    const route = await roadDistanceKm(order.pickup, order.address);

    res.json({
      pickup: order.pickup,
      drop: order.address,
      geometry: route.geometry,
      distanceKm: route.distanceKm,
      distanceEstimated: route.distanceEstimated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /partner/orders/:id/accept
 */
export async function acceptOrder(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await transition(id, 'PACKED', 'ASSIGNED', {
      partner: req.user,
      byUser: req.user._id,
      byRole: 'partner'
    });

    res.json({ order: formatPartnerOrder(updated, req.lang) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /partner/orders/:id/release
 */
export async function releaseOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    if (order.partner?.toString() !== req.user._id.toString()) {
      throw new HttpError(403, CODES.AUTH_FORBIDDEN, null, 'You are not assigned to this order');
    }

    const updated = await transition(id, 'ASSIGNED', 'PACKED', {
      byUser: req.user._id,
      byRole: 'partner',
      note: req.body.reason || 'Released by delivery partner'
    });

    res.json({ order: formatPartnerOrder(updated, req.lang) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /partner/orders/:id/pickup
 */
export async function pickupOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    if (order.partner?.toString() !== req.user._id.toString()) {
      throw new HttpError(403, CODES.AUTH_FORBIDDEN, null, 'You are not assigned to this order');
    }

    const updated = await transition(id, 'ASSIGNED', 'PICKED_UP', {
      byUser: req.user._id,
      byRole: 'partner'
    });

    res.json({ order: formatPartnerOrder(updated, req.lang) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /partner/orders/:id/deliver
 */
export async function deliverOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { code, location } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    if (order.partner?.toString() !== req.user._id.toString()) {
      throw new HttpError(403, CODES.AUTH_FORBIDDEN, null, 'You are not assigned to this order');
    }

    const updated = await transition(id, 'PICKED_UP', 'DELIVERED', {
      byUser: req.user._id,
      byRole: 'partner',
      code,
      location
    });

    res.json({
      order: formatPartnerOrder(updated, req.lang),
      collectAmountPaise: updated.paymentMethod === 'COD' ? updated.totalPayablePaise : 0
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /partner/orders/:id/fail
 */
export async function failOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { reason, note } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    if (order.partner?.toString() !== req.user._id.toString()) {
      throw new HttpError(403, CODES.AUTH_FORBIDDEN, null, 'You are not assigned to this order');
    }

    const updated = await transition(id, 'PICKED_UP', 'DELIVERY_FAILED', {
      byUser: req.user._id,
      byRole: 'partner',
      reason,
      note
    });

    res.json({ order: formatPartnerOrder(updated, req.lang) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /partner/history
 */
export async function getHistory(req, res, next) {
  try {
    const { page, pageSize, skip, limit } = parsePagination(req.query);

    const filter = {
      partner: req.user._id,
      status: { $in: ['DELIVERED', 'DELIVERY_FAILED'] }
    };

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .select('-deliveryCode')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('seller', 'shopName')
        .lean()
    ]);

    const items = orders.map((o) => formatPartnerOrder(o, req.lang));

    res.json({
      items,
      meta: buildPaginationMeta(total, page, pageSize)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /partner/earnings
 */
export async function getEarnings(req, res, next) {
  try {
    const earnings = await getPartnerEarnings({
      partnerUser: req.user,
      range: req.query.range || '7d',
      query: req.query
    });
    res.json(earnings);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /partner/cash-deposit
 */
export async function postCashDeposit(req, res, next) {
  try {
    const { amountPaise } = req.body;
    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'amountPaise must be a positive integer');
    }

    const [allCodCollected, allCodDeposited] = await Promise.all([
      LedgerEntry.aggregate([
        {
          $match: {
            user: req.user._id,
            role: 'partner',
            type: 'COD_CASH_COLLECTED'
          }
        },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]),
      LedgerEntry.aggregate([
        {
          $match: {
            user: req.user._id,
            role: 'partner',
            type: 'COD_CASH_DEPOSITED'
          }
        },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ])
    ]);

    const codCollected = allCodCollected[0]?.total || 0;
    const codDeposited = allCodDeposited[0]?.total || 0;
    const currentBalance = Math.max(0, codCollected - codDeposited);

    if (amountPaise > currentBalance) {
      throw new HttpError(
        400,
        CODES.AMOUNT_EXCEEDS_BALANCE,
        { currentBalance, requestedAmount: amountPaise },
        'Deposit amount exceeds pending COD cash balance'
      );
    }

    const entry = await LedgerEntry.create({
      user: req.user._id,
      role: 'partner',
      type: 'COD_CASH_DEPOSITED',
      amountPaise,
      note: 'Simulated COD cash deposit'
    });

    res.json({
      ok: true,
      transactionId: entry._id.toString(),
      depositedPaise: amountPaise,
      remainingCashToDepositPaise: currentBalance - amountPaise,
      label: 'SIMULATED_SETTLEMENT'
    });
  } catch (err) {
    next(err);
  }
}
