// server/src/utils/ids.js
import Counter from '../models/Counter.js';

/**
 * Returns formatted 2-digit number with leading zero.
 */
function pad(num, size = 2) {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}

/**
 * Gets current IST date string formatted as YYMMDD.
 */
export function getISTDateYYMMDD() {
  const now = new Date();
  // IST offset is UTC + 5h30m = 330 mins
  const istOffsetMs = 330 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffsetMs);
  const yy = String(istTime.getUTCFullYear()).slice(-2);
  const mm = pad(istTime.getUTCMonth() + 1, 2);
  const dd = pad(istTime.getUTCDate(), 2);
  return `${yy}${mm}${dd}`;
}

/**
 * Generates next sequential Order number: NR-YYMMDD-0001
 */
export async function generateOrderNo() {
  const yymmdd = getISTDateYYMMDD();
  const counterKey = `order-${yymmdd}`;

  const counter = await Counter.findByIdAndUpdate(
    counterKey,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `NR-${yymmdd}-${pad(counter.seq, 4)}`;
}

/**
 * Generates next sequential Support Ticket number: TK-00001
 */
export async function generateTicketNo() {
  const counter = await Counter.findByIdAndUpdate(
    'ticket',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `TK-${pad(counter.seq, 5)}`;
}

/**
 * Generates a 4-digit numeric delivery code (1000 - 9999)
 */
export function generateDeliveryCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default {
  getISTDateYYMMDD,
  generateOrderNo,
  generateTicketNo,
  generateDeliveryCode
};
