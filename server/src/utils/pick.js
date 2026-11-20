// server/src/utils/pick.js

/**
 * Returns the requested language string from a bilingual object { en, mr }.
 * Falls back to the other language only if empty or missing.
 */
export function pick(obj, lang = 'en') {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;

  const target = lang === 'mr' ? 'mr' : 'en';
  const fallback = target === 'mr' ? 'en' : 'mr';

  const val = obj[target];
  if (val && typeof val === 'string' && val.trim().length > 0) {
    return val;
  }

  const fallbackVal = obj[fallback];
  if (fallbackVal && typeof fallbackVal === 'string' && fallbackVal.trim().length > 0) {
    return fallbackVal;
  }

  return '';
}

export default pick;
