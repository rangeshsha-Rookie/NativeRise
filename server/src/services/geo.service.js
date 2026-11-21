// server/src/services/geo.service.js
import config from '../config/env.js';
import {
  OSRM_DETOUR_FACTOR,
  GEO_CACHE_TTL_MINUTES,
  DEFAULT_MAX_DELIVERY_KM
} from '../config/constants.js';
import { calculateETA, calculatePartnerPayout, calculateCustomerDeliveryCharge } from './pricing.service.js';

// In-memory cache with TTL
const cache = new Map();

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data, ttlMinutes = GEO_CACHE_TTL_MINUTES) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000
  });
}

/**
 * Straight-line distance using Haversine formula (km)
 */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Calculates road driving distance using OSRM with 4s timeout and cache.
 * Coordinates rounded to 4 decimals for caching.
 * Fallback: haversine * 1.3, distanceEstimated=true.
 */
export async function roadDistanceKm(a, b) {
  const lat1 = Math.round(a.lat * 10000) / 10000;
  const lng1 = Math.round(a.lng * 10000) / 10000;
  const lat2 = Math.round(b.lat * 10000) / 10000;
  const lng2 = Math.round(b.lng * 10000) / 10000;

  const cacheKey = `route:${lat1},${lng1};${lat2},${lng2}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const straightLine = haversineKm(lat1, lng1, lat2, lng2);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `${config.OSRM_BASE_URL}/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distKm = Math.round((route.distance / 1000) * 10) / 10;
        const result = {
          distanceKm: distKm,
          distanceEstimated: false,
          geometry: route.geometry?.coordinates || []
        };
        setCache(cacheKey, result);
        return result;
      }
    }
  } catch {
    // Timeout or network failure: fallback to haversine * 1.3
  }

  const fallback = {
    distanceKm: Math.round(straightLine * OSRM_DETOUR_FACTOR * 10) / 10,
    distanceEstimated: true,
    geometry: [
      [lng1, lat1],
      [lng2, lat2]
    ]
  };
  setCache(cacheKey, fallback);
  return fallback;
}

// Global queue for Nominatim: 1 request / second
let lastNominatimRequestTime = 0;
async function throttleNominatim() {
  const now = Date.now();
  const timeSinceLast = now - lastNominatimRequestTime;
  if (timeSinceLast < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLast));
  }
  lastNominatimRequestTime = Date.now();
}

/**
 * Searches locations using Nominatim with rate limiting & cache.
 */
export async function searchAddress(query, lang = 'en') {
  const cacheKey = `geo:search:${lang}:${query.toLowerCase().trim()}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  await throttleNominatim();

  const url = `${config.NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(
    query
  )}&format=jsonv2&countrycodes=in&limit=6&addressdetails=1&accept-language=${lang}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': config.NOMINATIM_USER_AGENT
      }
    });

    if (!res.ok) {
      throw new Error(`Nominatim error: ${res.statusText}`);
    }

    const data = await res.json();
    const results = data.map((item) => ({
      label: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type || 'place'
    }));

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.error(`[Geo:searchAddress] Failed: ${err.message}`);
    throw err;
  }
}

/**
 * Reverse geocodes coordinates to address details using Nominatim.
 */
export async function reverseGeocode(lat, lng, lang = 'en') {
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLng = Math.round(lng * 10000) / 10000;
  const cacheKey = `geo:reverse:${lang}:${roundedLat},${roundedLng}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  await throttleNominatim();

  const url = `${config.NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=18&addressdetails=1&accept-language=${lang}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': config.NOMINATIM_USER_AGENT
      }
    });

    if (!res.ok) {
      throw new Error(`Nominatim reverse error: ${res.statusText}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const village =
      addr.village || addr.suburb || addr.hamlet || addr.town || addr.city_district || addr.city || '';
    const district = addr.county || addr.state_district || addr.district || '';
    const state = addr.state || 'Maharashtra';
    const pincode = addr.postcode || '';

    const result = {
      label: data.display_name || '',
      line: data.display_name || '',
      village,
      district,
      state,
      pincode
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[Geo:reverseGeocode] Failed: ${err.message}`);
    throw err;
  }
}

/**
 * Checks delivery feasibility from seller to customer location (Section 11.2).
 */
export async function checkFeasibility(seller, customerCoords) {
  if (!seller.isAcceptingOrders) {
    return {
      feasible: false,
      distanceKm: 0,
      estimated: false,
      etaMins: 0,
      deliveryMode: seller.deliveryMode,
      deliveryChargePaise: 0,
      reason: 'SELLER_NOT_ACCEPTING'
    };
  }

  const { distanceKm, distanceEstimated } = await roadDistanceKm(seller.location, customerCoords);
  const maxKm = seller.maxDeliveryKm || DEFAULT_MAX_DELIVERY_KM;
  // If STRICT_GEOFENCE is enabled, strictly enforce maxKm radius.
  // In demo / test evaluation mode, allow orders so customers anywhere can test payments and workflows.
  const feasible = config.STRICT_GEOFENCE ? distanceKm <= maxKm : true;

  const eta = calculateETA(seller.prepTimeMins, distanceKm);
  const payout = calculatePartnerPayout(distanceKm);
  const charge = calculateCustomerDeliveryCharge(seller.deliveryMode, payout);

  return {
    feasible,
    distanceKm,
    estimated: distanceEstimated,
    etaMins: eta.etaMins,
    minEtaMins: eta.minEtaMins,
    maxEtaMins: eta.maxEtaMins,
    deliveryMode: seller.deliveryMode,
    deliveryChargePaise: charge,
    reason: feasible ? null : 'OUT_OF_RANGE'
  };
}

export default {
  haversineKm,
  roadDistanceKm,
  searchAddress,
  reverseGeocode,
  checkFeasibility
};
