// client/src/i18n/format.js

export function formatINR(paise = 0, lang = 'en') {
  const rupees = paise / 100;
  const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
  const hasDecimals = rupees % 1 !== 0;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0
  }).format(rupees);
}

export function formatNumber(num = 0, lang = 'en') {
  const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
  return new Intl.NumberFormat(locale).format(num);
}

export function formatDate(dateInput, lang = 'en') {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function formatTime(dateInput, lang = 'en') {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function formatDateTime(dateInput, lang = 'en') {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

export function formatRelativeTime(dateInput, lang = 'en') {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.round((date.getTime() - now.getTime()) / 1000);
  const locale = lang === 'mr' ? 'mr-IN' : 'en-IN';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) {
    return rtf.format(diffSec, 'second');
  }
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, 'minute');
  }
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) {
    return rtf.format(diffHour, 'hour');
  }
  const diffDay = Math.round(diffHour / 24);
  return rtf.format(diffDay, 'day');
}

export default {
  formatINR,
  formatNumber,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime
};
