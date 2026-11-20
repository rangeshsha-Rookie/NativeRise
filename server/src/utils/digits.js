// server/src/utils/digits.js

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const DEVANAGARI_TO_LATIN_MAP = {
  '०': '0',
  '१': '1',
  '२': '2',
  '३': '3',
  '४': '4',
  '५': '5',
  '६': '6',
  '७': '7',
  '८': '8',
  '९': '9'
};

/**
 * Normalizes Devanagari numerals (०-९) to Latin digits (0-9).
 * Returns undefined or null unchanged if passed.
 */
export function normalizeDigits(input) {
  if (input === null || input === undefined) return input;
  const str = String(input);
  return str.replace(/[०-९]/g, (char) => DEVANAGARI_TO_LATIN_MAP[char] || char);
}

/**
 * Converts Latin digits (0-9) to Devanagari digits (०-९).
 */
export function toDevanagariDigits(input) {
  if (input === null || input === undefined) return input;
  const str = String(input);
  return str.replace(/[0-9]/g, (char) => DEVANAGARI_DIGITS[parseInt(char, 10)] || char);
}

export default {
  normalizeDigits,
  toDevanagariDigits
};
