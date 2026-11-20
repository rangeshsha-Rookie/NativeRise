// server/src/services/orders.service.js
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import SellerProfile from '../models/SellerProfile.js';
import PartnerProfile from '../models/PartnerProfile.js';
import Idempotency from '../models/Idempotency.js';
import LedgerEntry from '../models/LedgerEntry.js';
import config from '../config/env.js';
import {
  DELIVERY_CODE_MAX_ATTEMPTS,
  DELIVERY_CODE_LOCK_MINUTES,
  DROP_GEOFENCE_METERS
} from '../config/constants.js';
import { checkFeasibility, haversineKm } from './geo.service.js';
import {
  calculatePartnerPayout,
  calculatePlatformFee,
  calculateCustomerDeliveryCharge,
  calculateSellerNet,
  calculateMinItemsTotalForIncluded
} from './pricing.service.js';
import { createRazorpayOrder, refundPayment } from './payments.service.js';
import { normalizeDigits } from '../utils/digits.js';
import { generateOrderNo, generateDeliveryCode } from '../utils/ids.js';
import { pick } from '../utils/pick.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

export function formatCustomerOrder(order, lang = 'en') {
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
    items: (o.items || []).map((it) => ({
      productId: it.product ? it.product.toString() : '',
      name: it.name ? pick(it.name, lang) : '',
      image: it.image || '',
      unitPricePaise: it.unitPricePaise,
      qty: it.qty,
      quantityValue: it.quantityValue,
      quantityUnit: it.quantityUnit,
      lineTotalPaise: it.unitPricePaise * it.qty
    })),
    amounts: {
      itemsTotalPaise: o.itemsTotalPaise,
      customerDeliveryChargePaise: o.customerDeliveryChargePaise,
      totalPayablePaise: o.totalPayablePaise,
      deliveryMode: o.deliveryMode
    },
    address: o.address,
    etaMins: o.etaMins,
    roadDistanceKm: o.roadDistanceKm,
    paymentMethod: o.paymentMethod,
    payment: {
      status: o.payment?.status,
      method: o.paymentMethod,
      instrument: o.payment?.paymentInstrument,
      paidAt: o.payment?.paidAt,
      refundId: o.payment?.refundId
    },
    partner:
      o.partner && (o.status === 'ASSIGNED' || o.status === 'PICKED_UP' || o.status === 'DELIVERED')
        ? {
            id: o.partner._id ? o.partner._id.toString() : o.partner.toString(),
            name: o.partner.name ? pick(o.partner.name, lang) : '',
            phone: o.partner.phone
          }
        : null,
    deliveryCode:
      ['PLACED', 'ACCEPTED', 'PACKED', 'ASSIGNED', 'PICKED_UP'].includes(o.status)
        ? o.deliveryCode
        : undefined,
    statusHistory: o.statusHistory || [],
    canCancel: o.status === 'PLACED' || o.status === 'AWAITING_PAYMENT'
  };
}

/**
 * Creates an order following the Section 14.6 specification
 */
export async function createOrder({
  customerUser,
  addressId,
  deliveryAddress,
  paymentMethod,
  expectedTotalPaise,
  idempotencyKey,
  lang = 'en'
}) {
  // 1. Idempotency check
  if (idempotencyKey) {
    const existing = await Idempotency.findOne({
      key: idempotencyKey,
      user: customerUser._id
    });
    if (existing && existing.response) {
      return existing.response;
    }
  }

  // 2. Validate address
  let address = null;
  if (addressId && customerUser.addresses?.id) {
    address = customerUser.addresses.id(addressId);
  }
  if (!address && deliveryAddress && deliveryAddress.lat !== undefined && deliveryAddress.lng !== undefined) {
    address = deliveryAddress;
  }
  if (!address && customerUser.addresses && customerUser.addresses.length > 0) {
    address = customerUser.addresses[0];
  }
  if (!address) {
    throw new HttpError(400, CODES.ADDRESS_REQUIRED, null, 'Valid address required');
  }

  // 3. Load cart
  const cart = await Cart.findOne({ user: customerUser._id }).populate([
    { path: 'items.product' },
    { path: 'seller' }
  ]);

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new HttpError(400, CODES.CART_EMPTY, null, 'Cart is empty');
  }

  const seller = cart.seller;
  if (!seller) {
    throw new HttpError(400, CODES.CART_EMPTY, null, 'No seller in cart');
  }

  if (!seller.isAcceptingOrders) {
    throw new HttpError(400, CODES.SELLER_NOT_ACCEPTING, null, 'Seller is not currently accepting orders');
  }

  // 4. Validate items and feasibility
  for (const item of cart.items) {
    const p = item.product;
    if (!p || p.status !== 'ACTIVE') {
      throw new HttpError(400, CODES.PRODUCT_UNAVAILABLE, { productId: p?._id }, 'Product unavailable');
    }
    if (item.qty > p.stock) {
      throw new HttpError(400, CODES.INSUFFICIENT_STOCK, { available: p.stock }, 'Insufficient stock');
    }
  }

  const feasibility = await checkFeasibility(seller, address);
  if (!feasibility.feasible) {
    if (feasibility.reason === 'SELLER_NOT_ACCEPTING') {
      throw new HttpError(400, CODES.SELLER_NOT_ACCEPTING, null, 'Seller is not accepting orders');
    }
    throw new HttpError(400, CODES.OUT_OF_DELIVERY_RANGE, null, 'Delivery location is out of range');
  }

  // Compute pricing
  let itemsTotalPaise = 0;
  const orderItems = cart.items.map((item) => {
    const p = item.product;
    const lineTotal = p.pricePaise * item.qty;
    itemsTotalPaise += lineTotal;
    return {
      product: p._id,
      name: { en: p.name.en, mr: p.name.mr },
      image: p.images?.[0] || '/seed-images/P01.svg',
      unitPricePaise: p.pricePaise,
      qty: item.qty,
      quantityValue: p.quantityValue,
      quantityUnit: p.quantityUnit
    };
  });

  if (itemsTotalPaise < (seller.minOrderPaise || 0)) {
    throw new HttpError(400, CODES.MIN_ORDER_NOT_MET, { neededPaise: seller.minOrderPaise - itemsTotalPaise }, 'Minimum order not met');
  }

  const partnerPayoutPaise = calculatePartnerPayout(feasibility.distanceKm);
  const platformFeePaise = calculatePlatformFee(itemsTotalPaise);
  const customerDeliveryChargePaise = calculateCustomerDeliveryCharge(seller.deliveryMode, partnerPayoutPaise);
  const totalPayablePaise = itemsTotalPaise + customerDeliveryChargePaise;
  const sellerNetPaise = calculateSellerNet({
    itemsTotalPaise,
    deliveryMode: seller.deliveryMode,
    partnerPayoutPaise,
    platformFeePaise
  });

  if (seller.deliveryMode === 'INCLUDED') {
    const minNeeded = calculateMinItemsTotalForIncluded(partnerPayoutPaise);
    if (itemsTotalPaise < minNeeded) {
      throw new HttpError(400, CODES.MIN_ORDER_NOT_MET, { neededPaise: minNeeded - itemsTotalPaise }, 'Minimum order not met for free delivery');
    }
  }

  // Check price change
  if (expectedTotalPaise !== undefined && Number(expectedTotalPaise) !== totalPayablePaise) {
    throw new HttpError(409, CODES.PRICE_CHANGED, { totalPayablePaise }, 'Total price has changed');
  }

  // 5. Reserve stock atomically
  const reservedProducts = [];
  for (const item of cart.items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product._id, status: 'ACTIVE', stock: { $gte: item.qty } },
      { $inc: { stock: -item.qty } },
      { new: true }
    );

    if (!updated) {
      // Rollback previous reservations
      for (const resItem of reservedProducts) {
        await Product.findByIdAndUpdate(resItem.productId, { $inc: { stock: resItem.qty } });
      }
      const freshProduct = await Product.findById(item.product._id);
      throw new HttpError(
        400,
        CODES.INSUFFICIENT_STOCK,
        { available: freshProduct ? freshProduct.stock : 0 },
        'Insufficient stock during checkout'
      );
    }
    reservedProducts.push({ productId: item.product._id, qty: item.qty });
  }

  // 6. Generate order numbers and code
  const orderNo = await generateOrderNo();
  const deliveryCode = generateDeliveryCode();

  const isCOD = paymentMethod === 'COD';
  const initialStatus = isCOD ? 'PLACED' : 'AWAITING_PAYMENT';
  const initialPaymentStatus = isCOD ? 'COD_PENDING' : 'PENDING';

  // 7. Create Order document
  const order = new Order({
    orderNo,
    customer: customerUser._id,
    seller: seller._id,
    items: orderItems,
    itemsTotalPaise,
    deliveryMode: seller.deliveryMode,
    customerDeliveryChargePaise,
    totalPayablePaise,
    partnerPayoutPaise,
    platformFeePaise,
    sellerNetPaise,
    address: {
      name: address.name || customerUser.name.en,
      phone: address.phone || customerUser.phone,
      line: address.line || address.line1 || 'Address',
      landmark: address.landmark || '',
      lat: address.lat,
      lng: address.lng
    },
    pickup: {
      lat: seller.location.lat,
      lng: seller.location.lng,
      line: seller.location.line
    },
    roadDistanceKm: feasibility.distanceKm,
    distanceEstimated: feasibility.estimated,
    etaMins: feasibility.etaMins,
    paymentMethod,
    payment: {
      status: initialPaymentStatus
    },
    status: initialStatus,
    statusHistory: [
      {
        status: initialStatus,
        at: new Date(),
        byUser: customerUser._id,
        byRole: 'customer'
      }
    ],
    deliveryCode,
    idempotencyKey
  });

  let razorpayData = null;

  if (!isCOD) {
    try {
      const rzpOrder = await createRazorpayOrder({
        orderId: order._id,
        orderNo,
        amountPaise: totalPayablePaise
      });

      order.payment.razorpayOrderId = rzpOrder.id;
      await order.save();

      razorpayData = {
        orderId: rzpOrder.id,
        amountPaise: totalPayablePaise,
        currency: 'INR',
        keyId: config.RAZORPAY_KEY_ID
      };
    } catch (err) {
      // Rollback reserved stock
      for (const resItem of reservedProducts) {
        await Product.findByIdAndUpdate(resItem.productId, { $inc: { stock: resItem.qty } });
      }
      throw err;
    }
  } else {
    await order.save();
  }

  // 8. Clear cart atomically
  await Cart.updateOne({ user: customerUser._id }, { $set: { items: [], seller: null } });

  const result = {
    order: formatCustomerOrder(order, lang),
    razorpay: razorpayData
  };

  // Save idempotency record
  if (idempotencyKey) {
    await Idempotency.create({
      key: idempotencyKey,
      user: customerUser._id,
      response: result
    }).catch(() => {});
  }

  return result;
}

/**
 * Executes an atomic order status transition with all side-effects
 */
export async function transition(orderId, expectedCurrentStatus, nextStatus, options = {}) {
  const { byUser, byRole, note, code, reason, partner, location } = options;

  const order = await Order.findById(orderId).select('+deliveryCode');
  if (!order) {
    throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
  }

  // Idempotency: if already in nextStatus, return
  if (order.status === nextStatus) {
    if (nextStatus === 'ASSIGNED') {
      if (order.partner && partner && order.partner.toString() === partner._id.toString()) {
        return order;
      }
      throw new HttpError(409, CODES.ORDER_ALREADY_ASSIGNED, null, 'Order already assigned to another partner');
    }
    return order;
  }

  // If order is not in expectedCurrentStatus
  if (order.status !== expectedCurrentStatus) {
    if (nextStatus === 'ASSIGNED' && (order.status === 'ASSIGNED' || order.partner)) {
      throw new HttpError(409, CODES.ORDER_ALREADY_ASSIGNED, null, 'Order already assigned to another partner');
    }
    throw new HttpError(400, CODES.ORDER_INVALID_TRANSITION, { current: order.status, next: nextStatus }, 'Invalid order transition');
  }

  // Validate state machine rule
  const validTransitions = {
    AWAITING_PAYMENT: ['PLACED', 'CANCELLED'],
    PLACED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    ACCEPTED: ['PACKED', 'REJECTED'],
    PACKED: ['ASSIGNED'],
    ASSIGNED: ['PICKED_UP', 'PACKED'],
    PICKED_UP: ['DELIVERED', 'DELIVERY_FAILED']
  };

  const allowed = validTransitions[expectedCurrentStatus];
  if (!allowed || !allowed.includes(nextStatus)) {
    throw new HttpError(400, CODES.ORDER_INVALID_TRANSITION, { current: order.status, next: nextStatus }, 'Invalid order transition');
  }

  // Specific transition side effects & pre-checks
  const now = new Date();
  const updateQuery = {
    status: nextStatus,
    $push: {
      statusHistory: {
        status: nextStatus,
        at: now,
        byUser: byUser || null,
        byRole: byRole || '',
        note: note || ''
      }
    }
  };

  // 1. Partner Assignment (PACKED -> ASSIGNED)
  if (nextStatus === 'ASSIGNED') {
    if (!partner) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Partner required for assignment');
    }
    const partnerProfile = await PartnerProfile.findOne({ user: partner._id });
    if (!partnerProfile || !partnerProfile.isOnline) {
      throw new HttpError(400, CODES.PARTNER_OFFLINE, null, 'Partner must be online to accept');
    }
    if (partnerProfile.activeOrder) {
      throw new HttpError(400, CODES.PARTNER_BUSY, null, 'Partner already has an active order');
    }

    // Atomic first-wins compare-and-set
    const assignedOrder = await Order.findOneAndUpdate(
      { _id: orderId, status: 'PACKED', partner: null },
      {
        $set: {
          status: 'ASSIGNED',
          partner: partner._id,
          partnerAssignedAt: now
        },
        $push: {
          statusHistory: {
            status: 'ASSIGNED',
            at: now,
            byUser: partner._id,
            byRole: 'partner'
          }
        }
      },
      { new: true }
    );

    if (!assignedOrder) {
      throw new HttpError(409, CODES.ORDER_ALREADY_ASSIGNED, null, 'Order already assigned to another partner');
    }

    partnerProfile.activeOrder = assignedOrder._id;
    await partnerProfile.save();
    return assignedOrder;
  }

  // 2. Partner Release (ASSIGNED -> PACKED)
  if (expectedCurrentStatus === 'ASSIGNED' && nextStatus === 'PACKED') {
    updateQuery.$set = {
      status: 'PACKED',
      partner: null,
      partnerAssignedAt: null
    };
    delete updateQuery.status;

    const released = await Order.findOneAndUpdate(
      { _id: orderId, status: 'ASSIGNED' },
      updateQuery,
      { new: true }
    );

    if (released && order.partner) {
      await PartnerProfile.updateOne({ user: order.partner }, { $set: { activeOrder: null } });
    }
    return released;
  }

  // 3. Partner Pickup (ASSIGNED -> PICKED_UP)
  if (nextStatus === 'PICKED_UP') {
    updateQuery.$set = {
      status: 'PICKED_UP',
      pickedUpAt: now
    };
    delete updateQuery.status;
  }

  // 4. Partner Delivery (PICKED_UP -> DELIVERED)
  if (nextStatus === 'DELIVERED') {
    if (!code) {
      throw new HttpError(400, CODES.DELIVERY_CODE_INVALID, null, 'Delivery code is required');
    }

    // Check code lock
    if (order.codeLockedUntil && order.codeLockedUntil > now) {
      throw new HttpError(400, CODES.DELIVERY_CODE_LOCKED, null, 'Delivery code entry is temporarily locked');
    }

    const cleanInputCode = normalizeDigits(code);
    const expectedCode = normalizeDigits(order.deliveryCode || '');

    if (cleanInputCode !== expectedCode) {
      const attempts = (order.codeAttempts || 0) + 1;
      let lockUntil = null;
      if (attempts >= DELIVERY_CODE_MAX_ATTEMPTS) {
        lockUntil = new Date(now.getTime() + DELIVERY_CODE_LOCK_MINUTES * 60 * 1000);
      }
      await Order.findByIdAndUpdate(orderId, {
        codeAttempts: attempts,
        codeLockedUntil: lockUntil
      });
      if (lockUntil) {
        throw new HttpError(400, CODES.DELIVERY_CODE_LOCKED, null, 'Too many incorrect attempts. Code locked.');
      }
      throw new HttpError(400, CODES.DELIVERY_CODE_INVALID, null, 'Incorrect delivery code');
    }

    // Reset attempts on correct code
    updateQuery.$set = {
      status: 'DELIVERED',
      deliveredAt: now,
      codeAttempts: 0,
      codeLockedUntil: null
    };

    // Geofence check
    if (location && order.address) {
      const dropDistanceMeters = haversineKm(location.lat, location.lng, order.address.lat, order.address.lng) * 1000;
      if (dropDistanceMeters > DROP_GEOFENCE_METERS) {
        if (config.STRICT_GEOFENCE) {
          throw new HttpError(400, CODES.PARTNER_OUT_OF_RANGE, null, 'Partner too far from delivery address');
        } else {
          updateQuery.$set.deliveredFarFromDrop = true;
        }
      }
    }

    if (order.paymentMethod === 'COD') {
      updateQuery.$set['payment.status'] = 'COD_COLLECTED';
    }
    delete updateQuery.status;
  }

  // 5. Delivery Failed (PICKED_UP -> DELIVERY_FAILED)
  if (nextStatus === 'DELIVERY_FAILED') {
    updateQuery.$set = {
      status: 'DELIVERY_FAILED',
      failure: {
        reason: reason || 'OTHER',
        note: note || '',
        at: now
      }
    };
    delete updateQuery.status;
  }

  // 6. Cancellation (AWAITING_PAYMENT / PLACED -> CANCELLED)
  if (nextStatus === 'CANCELLED') {
    updateQuery.$set = {
      status: 'CANCELLED',
      cancellation: {
        by: byRole || 'customer',
        reason: reason || note || 'Cancelled by user',
        at: now
      }
    };
    delete updateQuery.status;
  }

  // 7. Rejection (PLACED / ACCEPTED -> REJECTED)
  if (nextStatus === 'REJECTED') {
    updateQuery.$set = {
      status: 'REJECTED',
      cancellation: {
        by: 'seller',
        reason: reason || note || 'Rejected by seller',
        at: now
      }
    };
    delete updateQuery.status;
  }

  // Execute atomic compare-and-set update
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: orderId, status: expectedCurrentStatus },
    updateQuery,
    { new: true }
  );

  if (!updatedOrder) {
    throw new HttpError(400, CODES.ORDER_INVALID_TRANSITION, null, 'Order status changed concurrently');
  }

  // Post-transition side effects:
  // Stock restore and refunds on terminal failure / cancel / reject
  if (
    nextStatus === 'CANCELLED' ||
    nextStatus === 'REJECTED' ||
    nextStatus === 'DELIVERY_FAILED'
  ) {
    // Restore stock exactly once
    if (!updatedOrder.stockRestored) {
      updatedOrder.stockRestored = true;
      await updatedOrder.save();
      for (const item of updatedOrder.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
      }
    }

    // Refund if prepaid
    if (updatedOrder.payment?.status === 'PAID' && updatedOrder.payment?.razorpayPaymentId) {
      try {
        const refund = await refundPayment(
          updatedOrder.payment.razorpayPaymentId,
          updatedOrder.totalPayablePaise,
          reason || 'Order cancelled/rejected'
        );
        updatedOrder.payment.status = 'REFUNDED';
        updatedOrder.payment.refundId = refund.id;
        updatedOrder.payment.refundedAt = new Date();
        await updatedOrder.save();
      } catch (err) {
        console.error(`[Order:${orderId}] Refund failed:`, err.message);
      }
    }

    // Clear partner active order
    if (updatedOrder.partner) {
      await PartnerProfile.updateOne({ user: updatedOrder.partner }, { $set: { activeOrder: null } });
    }
  }

  // Ledger postings and sold count on DELIVERED
  if (nextStatus === 'DELIVERED') {
    if (!updatedOrder.ledgerPosted) {
      updatedOrder.ledgerPosted = true;
      await updatedOrder.save();

      const sellerProfile = await SellerProfile.findById(updatedOrder.seller);

      // 1. Seller ledger
      if (sellerProfile) {
        await LedgerEntry.create({
          user: sellerProfile.user,
          role: 'seller',
          order: updatedOrder._id,
          type: 'SELLER_EARNING',
          amountPaise: updatedOrder.sellerNetPaise,
          breakdown: {
            itemsTotalPaise: updatedOrder.itemsTotalPaise,
            platformFeePaise: updatedOrder.platformFeePaise,
            deliveryCostPaise:
              updatedOrder.deliveryMode === 'INCLUDED' ? updatedOrder.partnerPayoutPaise : 0,
            netPaise: updatedOrder.sellerNetPaise
          },
          note: `Delivered order ${updatedOrder.orderNo}`
        });
      }

      // 2. Partner ledger
      if (updatedOrder.partner) {
        await LedgerEntry.create({
          user: updatedOrder.partner,
          role: 'partner',
          order: updatedOrder._id,
          type: 'PARTNER_EARNING',
          amountPaise: updatedOrder.partnerPayoutPaise,
          note: `Delivery payout ${updatedOrder.orderNo}`
        });

        // 3. COD Collected ledger
        if (updatedOrder.paymentMethod === 'COD') {
          await LedgerEntry.create({
            user: updatedOrder.partner,
            role: 'partner',
            order: updatedOrder._id,
            type: 'COD_CASH_COLLECTED',
            amountPaise: updatedOrder.totalPayablePaise,
            note: `COD collected for order ${updatedOrder.orderNo}`
          });
        }

        await PartnerProfile.updateOne({ user: updatedOrder.partner }, { $set: { activeOrder: null } });
      }

      // 4. Increment soldCount per product
      for (const item of updatedOrder.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { soldCount: item.qty } });
      }
    }
  }

  return updatedOrder;
}
