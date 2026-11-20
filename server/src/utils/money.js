// server/src/utils/money.js

export function toPaise(rupees) {
  if (typeof rupees === 'string') {
    rupees = parseFloat(rupees);
  }
  return Math.round(rupees * 100);
}

export function toRupees(paise) {
  return paise / 100;
}

export function isPaiseInteger(val) {
  return typeof val === 'number' && Number.isInteger(val) && val >= 0;
}

export function formatINR(paise, lang = 'en') {
  const rupees = (paise || 0) / 100;
  const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
  const hasDecimals = rupees % 1 !== 0;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0
  }).format(rupees);
}

export default {
  toPaise,
  toRupees,
  isPaiseInteger,
  formatINR
};
