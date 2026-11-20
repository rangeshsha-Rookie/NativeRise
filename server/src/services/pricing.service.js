// server/src/services/pricing.service.js
import {
  PLATFORM_FEE_PERCENT,
  PARTNER_BASE_FEE_PAISE,
  PARTNER_PER_KM_PAISE,
  PARTNER_MIN_PAYOUT_PAISE,
  AVG_SPEED_KMPH
} from '../config/constants.js';

/**
 * Calculates delivery partner payout in paise.
 * raw = PARTNER_BASE_FEE_PAISE + round(PARTNER_PER_KM_PAISE * roadKm);
 * payout = max(PARTNER_MIN_PAYOUT_PAISE, round to nearest 100 paise).
 */
export function calculatePartnerPayout(roadDistanceKm) {
  const km = Math.max(0, Number(roadDistanceKm) || 0);
  const raw = PARTNER_BASE_FEE_PAISE + Math.round(PARTNER_PER_KM_PAISE * km);
  const roundedTo100 = Math.round(raw / 100) * 100;
  return Math.max(PARTNER_MIN_PAYOUT_PAISE, roundedTo100);
}

/**
 * Calculates platform fee in paise.
 * platformFeePaise = round(itemsTotalPaise * PLATFORM_FEE_PERCENT / 100).
 */
export function calculatePlatformFee(itemsTotalPaise) {
  const total = Math.max(0, Number(itemsTotalPaise) || 0);
  return Math.round((total * PLATFORM_FEE_PERCENT) / 100);
}

/**
 * Calculates customer delivery charge in paise.
 * INCLUDED: 0
 * CUSTOMER_PAYS: partnerPayoutPaise
 */
export function calculateCustomerDeliveryCharge(deliveryMode, partnerPayoutPaise) {
  if (deliveryMode === 'CUSTOMER_PAYS') {
    return partnerPayoutPaise;
  }
  return 0; // INCLUDED
}

/**
 * Calculates seller net earnings in paise.
 * INCLUDED: itemsTotal - platformFee - partnerPayout
 * CUSTOMER_PAYS: itemsTotal - platformFee
 */
export function calculateSellerNet({
  itemsTotalPaise,
  deliveryMode,
  partnerPayoutPaise,
  platformFeePaise
}) {
  const fee = platformFeePaise !== undefined ? platformFeePaise : calculatePlatformFee(itemsTotalPaise);
  if (deliveryMode === 'CUSTOMER_PAYS') {
    return itemsTotalPaise - fee;
  }
  // INCLUDED
  return itemsTotalPaise - fee - partnerPayoutPaise;
}

/**
 * Minimum itemsTotal required when INCLUDED to avoid negative net.
 * neededPaise = ceil(payout / (1 - 0.05) / 100) * 100
 */
export function calculateMinItemsTotalForIncluded(partnerPayoutPaise) {
  return Math.ceil(partnerPayoutPaise / (1 - PLATFORM_FEE_PERCENT / 100) / 100) * 100;
}

/**
 * Calculates estimated delivery time in minutes and formatted range.
 * etaMins = seller.prepTimeMins + round(roadDistanceKm / AVG_SPEED_KMPH * 60).
 * Range: etaMins to round(etaMins * 1.2).
 */
export function calculateETA(prepTimeMins, roadDistanceKm) {
  const prep = Number(prepTimeMins) || 0;
  const km = Math.max(0, Number(roadDistanceKm) || 0);
  const travelMins = Math.round((km / AVG_SPEED_KMPH) * 60);
  const etaMins = prep + travelMins;
  const maxEtaMins = Math.round(etaMins * 1.2);

  return {
    etaMins,
    minEtaMins: etaMins,
    maxEtaMins
  };
}

/**
 * Full quote / pricing calculator
 */
export function calculateOrderAmounts({
  itemsTotalPaise,
  deliveryMode = 'INCLUDED',
  roadDistanceKm
}) {
  const partnerPayoutPaise = calculatePartnerPayout(roadDistanceKm);
  const platformFeePaise = calculatePlatformFee(itemsTotalPaise);
  const customerDeliveryChargePaise = calculateCustomerDeliveryCharge(deliveryMode, partnerPayoutPaise);
  const totalPayablePaise = itemsTotalPaise + customerDeliveryChargePaise;
  const sellerNetPaise = calculateSellerNet({
    itemsTotalPaise,
    deliveryMode,
    partnerPayoutPaise,
    platformFeePaise
  });

  return {
    itemsTotalPaise,
    deliveryMode,
    partnerPayoutPaise,
    platformFeePaise,
    customerDeliveryChargePaise,
    totalPayablePaise,
    sellerNetPaise
  };
}

export default {
  calculatePartnerPayout,
  calculatePlatformFee,
  calculateCustomerDeliveryCharge,
  calculateSellerNet,
  calculateMinItemsTotalForIncluded,
  calculateETA,
  calculateOrderAmounts
};
