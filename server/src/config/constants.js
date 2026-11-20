// server/src/config/constants.js
// Exact values per Master Specification Section 6.2

export const PLATFORM_FEE_PERCENT = 5;
export const PARTNER_BASE_FEE_PAISE = 1500;          // Rs 15
export const PARTNER_PER_KM_PAISE = 400;             // Rs 4 per km
export const PARTNER_MIN_PAYOUT_PAISE = 2500;        // Rs 25
export const AVG_SPEED_KMPH = 25;
export const OSRM_DETOUR_FACTOR = 1.3;               // fallback if OSRM fails
export const NEARING_KM = 1;
export const DROP_GEOFENCE_METERS = 300;             // advisory unless STRICT_GEOFENCE
export const DEFAULT_MAX_DELIVERY_KM = 30;
export const DEFAULT_PREP_MINS = 120;
export const DEFAULT_MIN_ORDER_PAISE = 15000;        // Rs 150
export const PARTNER_DEFAULT_RADIUS_KM = 20;
export const PAYMENT_TIMEOUT_MINS = 30;
export const AUTO_REJECT_HOURS = 6;
export const DELIVERY_CODE_LENGTH = 4;
export const DELIVERY_CODE_MAX_ATTEMPTS = 5;
export const DELIVERY_CODE_LOCK_MINS = 5;
export const TRACK_POINT_MIN_INTERVAL_SEC = 10;
export const TRAIL_MAX_POINTS = 500;
export const LOCATION_STALE_SECONDS = 120;
export const POLL_INTERVAL_MS = 5000;
export const MAX_CART_QTY_PER_ITEM = 50;
export const MAX_IMAGES_PER_PRODUCT = 5;
export const IMAGE_MAX_MB = 5;
export const PAGE_SIZE_DEFAULT = 12;
export const PAGE_SIZE_MAX = 50;
export const GEO_CACHE_TTL_MINUTES = 60;
export const ASSISTANT_HISTORY_MAX_MESSAGES = 10;
export const AI_TIMEOUT_MS = 25000;
