// server/src/services/tracking.service.js
import Order from '../models/Order.js';
import PartnerProfile from '../models/PartnerProfile.js';
import {
  NEARING_KM,
  DROP_GEOFENCE_METERS,
  TRACK_POINT_MIN_INTERVAL_SEC,
  TRAIL_MAX_POINTS
} from '../config/constants.js';
import { haversineKm } from './geo.service.js';

/**
 * Updates partner location and tracking trail for active PICKED_UP order
 */
export async function updatePartnerLocation({
  partnerUser,
  lat,
  lng,
  accuracy = 10,
  simulated = false
}) {
  const now = new Date();

  // 1. Update partner profile lastLocation
  await PartnerProfile.updateOne(
    { user: partnerUser._id },
    {
      $set: {
        lastLocation: {
          lat,
          lng,
          accuracy,
          at: now
        }
      }
    }
  );

  // 2. If partner has an order in PICKED_UP, update live tracking
  const activeOrder = await Order.findOne({
    partner: partnerUser._id,
    status: 'PICKED_UP'
  });

  if (!activeOrder) {
    return { ok: true, tracking: false };
  }

  // Reject accuracy > 500m for trail points
  const isValidPoint = accuracy <= 500;

  activeOrder.liveLocation = {
    lat,
    lng,
    accuracy,
    at: now,
    simulated: !!simulated
  };

  if (isValidPoint) {
    const lastTrailPoint = activeOrder.trail?.[activeOrder.trail.length - 1];
    let shouldAddPoint = false;

    if (!lastTrailPoint) {
      shouldAddPoint = true;
    } else {
      const timeSinceLastSec = (now.getTime() - new Date(lastTrailPoint.at).getTime()) / 1000;
      const movedMeters = haversineKm(lastTrailPoint.lat, lastTrailPoint.lng, lat, lng) * 1000;

      if (timeSinceLastSec >= TRACK_POINT_MIN_INTERVAL_SEC || movedMeters > 25) {
        shouldAddPoint = true;
      }
    }

    if (shouldAddPoint) {
      activeOrder.trail.push({
        lat,
        lng,
        at: now,
        simulated: !!simulated
      });

      // Cap trail length
      if (activeOrder.trail.length > TRAIL_MAX_POINTS) {
        activeOrder.trail.shift();
      }
    }
  }

  // 3. Milestones detection
  if (activeOrder.address && activeOrder.address.lat && activeOrder.address.lng) {
    const distToDropKm = haversineKm(lat, lng, activeOrder.address.lat, activeOrder.address.lng);
    const distToDropMeters = distToDropKm * 1000;

    if (!activeOrder.milestones) {
      activeOrder.milestones = {};
    }

    if (distToDropKm <= NEARING_KM && !activeOrder.milestones.nearingAt) {
      activeOrder.milestones.nearingAt = now;
    }

    if (distToDropMeters <= DROP_GEOFENCE_METERS && !activeOrder.milestones.arrivedAt) {
      activeOrder.milestones.arrivedAt = now;
    }
  }

  await activeOrder.save();
  return { ok: true, tracking: true };
}
