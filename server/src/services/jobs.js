// server/src/services/jobs.js
import Order from '../models/Order.js';
import PartnerProfile from '../models/PartnerProfile.js';
import Product from '../models/Product.js';
import {
  PAYMENT_TIMEOUT_MINS,
  AUTO_REJECT_HOURS,
  LOCATION_STALE_SECONDS
} from '../config/constants.js';

let interval5m = null;
let interval1m = null;

export async function checkPaymentTimeouts() {
  try {
    const cutoff = new Date(Date.now() - PAYMENT_TIMEOUT_MINS * 60 * 1000);
    const expiredOrders = await Order.find({
      status: 'AWAITING_PAYMENT',
      createdAt: { $lt: cutoff }
    });

    let cancelledCount = 0;
    for (const order of expiredOrders) {
      // Restore stock if not already restored
      if (!order.stockRestored) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
        }
        order.stockRestored = true;
      }

      order.status = 'CANCELLED';
      order.cancellation = {
        by: 'system',
        reason: 'Payment timed out after 30 minutes',
        at: new Date()
      };
      order.statusHistory.push({
        status: 'CANCELLED',
        at: new Date(),
        byRole: 'system',
        note: 'Payment window expired'
      });
      await order.save();
      cancelledCount++;
    }

    if (cancelledCount > 0) {
      console.log(`[Job:PaymentTimeout] Cancelled ${cancelledCount} expired orders`);
    }
  } catch (err) {
    console.error(`[Job:PaymentTimeout] Error: ${err.message}`);
  }
}

export async function checkAutoRejections() {
  try {
    const cutoff = new Date(Date.now() - AUTO_REJECT_HOURS * 60 * 60 * 1000);
    const stalePlacedOrders = await Order.find({
      status: 'PLACED',
      createdAt: { $lt: cutoff }
    });

    let rejectedCount = 0;
    for (const order of stalePlacedOrders) {
      if (!order.stockRestored) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
        }
        order.stockRestored = true;
      }

      order.status = 'REJECTED';
      order.failure = {
        reason: 'OTHER',
        note: 'Auto-rejected: seller did not respond within 6 hours',
        at: new Date()
      };
      order.statusHistory.push({
        status: 'REJECTED',
        at: new Date(),
        byRole: 'system',
        note: 'Auto-rejected after 6 hours'
      });
      await order.save();
      rejectedCount++;
    }

    if (rejectedCount > 0) {
      console.log(`[Job:AutoReject] Auto-rejected ${rejectedCount} unaccepted orders`);
    }
  } catch (err) {
    console.error(`[Job:AutoReject] Error: ${err.message}`);
  }
}

export async function checkStalePartners() {
  try {
    const staleCutoff = new Date(Date.now() - LOCATION_STALE_SECONDS * 3 * 1000);
    const res = await PartnerProfile.updateMany(
      {
        isOnline: true,
        activeOrder: null,
        $or: [
          { 'lastLocation.at': { $lt: staleCutoff } },
          { lastLocation: null }
        ]
      },
      {
        $set: { isOnline: false }
      }
    );

    if (res.modifiedCount > 0) {
      console.log(`[Job:StalePartners] Marked ${res.modifiedCount} idle stale partners offline`);
    }
  } catch (err) {
    console.error(`[Job:StalePartners] Error: ${err.message}`);
  }
}

export function startJobs() {
  // 5 minute jobs
  interval5m = setInterval(async () => {
    await checkPaymentTimeouts();
    await checkAutoRejections();
  }, 5 * 60 * 1000);

  // 1 minute jobs
  interval1m = setInterval(async () => {
    await checkStalePartners();
  }, 60 * 1000);

  console.log('[Jobs] Background maintenance jobs started');
}

export function stopJobs() {
  if (interval5m) clearInterval(interval5m);
  if (interval1m) clearInterval(interval1m);
  console.log('[Jobs] Background maintenance jobs stopped');
}

export default {
  startJobs,
  stopJobs,
  checkPaymentTimeouts,
  checkAutoRejections,
  checkStalePartners
};
