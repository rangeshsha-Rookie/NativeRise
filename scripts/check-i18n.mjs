// scripts/check-i18n.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientLocalesDir = path.resolve(__dirname, '../client/src/i18n/locales');
const enDir = path.join(clientLocalesDir, 'en');
const mrDir = path.join(clientLocalesDir, 'mr');

// Latin allowlist per Section 8.9
const ALLOWLIST_WORDS = [
  'NativeRise',
  'Razorpay',
  'UPI',
  'COD',
  'OpenStreetMap',
  'Leaflet',
  'kg',
  'g',
  'ml',
  'l',
  'Rs',
  'test',
  'km',
  'min'
];

function flattenKeys(obj, prefix = '') {
  let keys = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      Object.assign(keys, flattenKeys(v, fullKey));
    } else {
      keys[fullKey] = v;
    }
  }
  return keys;
}

function checkNamespace(ns) {
  const enFile = path.join(enDir, `${ns}.json`);
  const mrFile = path.join(mrDir, `${ns}.json`);

  if (!fs.existsSync(enFile)) {
    console.error(`❌ Missing English namespace file: ${ns}.json`);
    return false;
  }
  if (!fs.existsSync(mrFile)) {
    console.error(`❌ Missing Marathi namespace file: ${ns}.json`);
    return false;
  }

  const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  const mrData = JSON.parse(fs.readFileSync(mrFile, 'utf8'));

  const enFlat = flattenKeys(enData);
  const mrFlat = flattenKeys(mrData);

  let hasError = false;

  // 1. Key Parity Check
  for (const key of Object.keys(enFlat)) {
    if (!(key in mrFlat)) {
      console.error(`❌ Key missing in [mr/${ns}.json]: ${key}`);
      hasError = true;
    }
  }

  for (const key of Object.keys(mrFlat)) {
    if (!(key in enFlat)) {
      console.error(`❌ Extra unexpected key in [mr/${ns}.json]: ${key}`);
      hasError = true;
    }
  }

  // 2. Validate Marathi content
  const devanagariRegex = /[\u0900-\u097F]/;
  const latinLetterRegex = /[a-zA-Z]/g;

  for (const [key, val] of Object.entries(mrFlat)) {
    if (typeof val !== 'string') continue;

    // Check empty or untranslated identical
    if (val.trim() === '') {
      console.error(`❌ Empty value in [mr/${ns}.json]: ${key}`);
      hasError = true;
      continue;
    }

    if (val === enFlat[key] && !ALLOWLIST_WORDS.includes(val)) {
      console.warn(`⚠️ Warning: Marathi value identical to English in [${ns}.json]: ${key} = "${val}"`);
    }

    // Check presence of Devanagari (unless it's an allowlisted acronym or symbol)
    const isAllowlistedOnly = ALLOWLIST_WORDS.includes(val.trim());
    if (!isAllowlistedOnly && !devanagariRegex.test(val)) {
      console.error(`❌ Marathi entry contains NO Devanagari characters in [${ns}.json]: ${key} = "${val}"`);
      hasError = true;
    }

    // Check forbidden Latin letters outside allowlist
    let stripped = val;
    // Strip interpolations {{variable}}
    stripped = stripped.replace(/\{\{[^}]+\}\}/g, '');
    // Strip URLs and emails
    stripped = stripped.replace(/https?:\/\/[^\s]+/g, '');
    stripped = stripped.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
    // Strip order numbers NR-..., ticket numbers TK-...
    stripped = stripped.replace(/NR-[\w-]+/g, '');
    stripped = stripped.replace(/TK-[\w-]+/g, '');

    // Strip allowlisted words
    for (const word of ALLOWLIST_WORDS) {
      stripped = stripped.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
    }

    const remainingLatin = stripped.match(latinLetterRegex);
    if (remainingLatin) {
      console.error(`❌ Forbidden Latin letters [${remainingLatin.join('')}] in [mr/${ns}.json]: ${key} = "${val}"`);
      hasError = true;
    }
  }

  return !hasError;
}

function run() {
  if (!fs.existsSync(enDir) || !fs.existsSync(mrDir)) {
    console.error('Locales directories not found!');
    process.exit(1);
  }

  const namespaces = fs
    .readdirSync(enDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));

  console.log(`Checking ${namespaces.length} i18n namespaces for key parity and translation completeness...`);

  let allPass = true;
  for (const ns of namespaces) {
    const ok = checkNamespace(ns);
    if (!ok) allPass = false;
  }

  if (allPass) {
    console.log('✅ All i18n namespace checks passed with zero missing keys!');
    process.exit(0);
  } else {
    console.error('❌ i18n verification failed!');
    process.exit(1);
  }
}

run();
