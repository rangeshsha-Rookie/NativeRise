// server/src/services/ledger.service.js
import LedgerEntry from '../models/LedgerEntry.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

function getRangeStartDate(range) {
  const now = new Date();
  if (range === '7d') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (range === '30d') {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return new Date(0); // 'all'
}

/**
 * Get seller earnings summary, time series and rows
 */
export async function getSellerEarnings({ sellerUser, range = '7d', query = {} }) {
  const startDate = getRangeStartDate(range);
  const { page, pageSize, skip, limit } = parsePagination(query);

  const filter = {
    user: sellerUser._id,
    role: 'seller',
    type: 'SELLER_EARNING',
    createdAt: { $gte: startDate }
  };

  const [totalRows, entries, allInRange] = await Promise.all([
    LedgerEntry.countDocuments(filter),
    LedgerEntry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('order', 'orderNo deliveredAt')
      .lean(),
    LedgerEntry.find(filter).lean()
  ]);

  let netPaise = 0;
  let itemsTotalPaise = 0;
  let platformFeePaise = 0;
  let deliveryCostPaise = 0;

  const dayMap = {};

  allInRange.forEach((entry) => {
    netPaise += entry.amountPaise || 0;
    const bd = entry.breakdown || {};
    itemsTotalPaise += bd.itemsTotalPaise || 0;
    platformFeePaise += bd.platformFeePaise || 0;
    deliveryCostPaise += bd.deliveryCostPaise || 0;

    // Date in IST (UTC + 5:30)
    const istDate = new Date(new Date(entry.createdAt).getTime() + 5.5 * 3600 * 1000)
      .toISOString()
      .split('T')[0];

    if (!dayMap[istDate]) {
      dayMap[istDate] = { date: istDate, netPaise: 0, orders: 0 };
    }
    dayMap[istDate].netPaise += entry.amountPaise || 0;
    dayMap[istDate].orders += 1;
  });

  const series = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

  const rows = entries.map((e) => ({
    orderNo: e.order?.orderNo || 'N/A',
    deliveredAt: e.createdAt,
    itemsTotalPaise: e.breakdown?.itemsTotalPaise || 0,
    platformFeePaise: e.breakdown?.platformFeePaise || 0,
    deliveryCostPaise: e.breakdown?.deliveryCostPaise || 0,
    netPaise: e.amountPaise
  }));

  return {
    totals: {
      netPaise,
      itemsTotalPaise,
      platformFeePaise,
      deliveryCostPaise,
      orders: allInRange.length
    },
    series,
    rows,
    meta: buildPaginationMeta(totalRows, page, pageSize),
    label: 'SIMULATED_SETTLEMENT'
  };
}

/**
 * Get partner earnings, deliveries and cash to deposit balance
 */
export async function getPartnerEarnings({ partnerUser, range = '7d', query = {} }) {
  const startDate = getRangeStartDate(range);
  const { page, pageSize, skip, limit } = parsePagination(query);

  const earningsFilter = {
    user: partnerUser._id,
    role: 'partner',
    type: 'PARTNER_EARNING',
    createdAt: { $gte: startDate }
  };

  const [totalRows, entries, allEarnings, allCodCollected, allCodDeposited] = await Promise.all([
    LedgerEntry.countDocuments(earningsFilter),
    LedgerEntry.find(earningsFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('order', 'orderNo totalPayablePaise paymentMethod')
      .lean(),
    LedgerEntry.find(earningsFilter).lean(),
    LedgerEntry.find({ user: partnerUser._id, role: 'partner', type: 'COD_CASH_COLLECTED' }).lean(),
    LedgerEntry.find({ user: partnerUser._id, role: 'partner', type: 'COD_CASH_DEPOSITED' }).lean()
  ]);

  let totalPayoutPaise = 0;
  const dayMap = {};

  allEarnings.forEach((entry) => {
    totalPayoutPaise += entry.amountPaise || 0;

    const istDate = new Date(new Date(entry.createdAt).getTime() + 5.5 * 3600 * 1000)
      .toISOString()
      .split('T')[0];

    if (!dayMap[istDate]) {
      dayMap[istDate] = { date: istDate, payoutPaise: 0, deliveries: 0 };
    }
    dayMap[istDate].payoutPaise += entry.amountPaise || 0;
    dayMap[istDate].deliveries += 1;
  });

  const series = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

  // Compute cash to deposit (total collected - total deposited)
  const codCollectedTotal = allCodCollected.reduce((sum, e) => sum + (e.amountPaise || 0), 0);
  const codDepositedTotal = allCodDeposited.reduce((sum, e) => sum + (e.amountPaise || 0), 0);
  const cashToDepositPaise = Math.max(0, codCollectedTotal - codDepositedTotal);

  const rows = entries.map((e) => ({
    orderNo: e.order?.orderNo || 'N/A',
    deliveredAt: e.createdAt,
    payoutPaise: e.amountPaise,
    codAmountPaise: e.order?.paymentMethod === 'COD' ? e.order.totalPayablePaise : 0
  }));

  return {
    totals: {
      payoutPaise: totalPayoutPaise,
      deliveries: allEarnings.length
    },
    cashToDepositPaise,
    series,
    rows,
    meta: buildPaginationMeta(totalRows, page, pageSize),
    label: 'SIMULATED_SETTLEMENT'
  };
}
