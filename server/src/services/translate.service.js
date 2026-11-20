// server/src/services/translate.service.js
import crypto from 'crypto';
import TranslationCache from '../models/TranslationCache.js';
import { generateJson } from './ai/gemini.client.js';

export function hasDevanagari(str) {
  return /[\u0900-\u097F]/.test(str || '');
}

export function detectLanguage(text) {
  return hasDevanagari(text) ? 'mr' : 'en';
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Translates or transliterates up to 10 fields using Gemini and caches each in MongoDB.
 * @param {Object} options
 * @param {Record<string, string>} options.fields - Key-value map of texts to translate
 * @param {string} options.from - Source language ('en' | 'mr')
 * @param {string} options.to - Target language ('en' | 'mr')
 * @param {'translate' | 'transliterate'} [options.mode='translate']
 * @returns {Promise<{ results: Record<string, string>, translationOk: boolean }>}
 */
export async function translateFields({ fields = {}, from, to, mode = 'translate' }) {
  const keys = Object.keys(fields).filter((k) => typeof fields[k] === 'string' && fields[k].trim() !== '');
  if (keys.length === 0) {
    return { results: {}, translationOk: true };
  }

  const results = {};
  const uncached = {};
  const uncachedHashes = {};

  // Check cache for each field
  for (const key of keys) {
    const text = fields[key].trim();
    const hash = sha256(`${from}|${to}|${mode}|${text}`);
    try {
      const cached = await TranslationCache.findOne({ hash }).lean();
      if (cached && cached.result) {
        results[key] = cached.result;
      } else {
        uncached[key] = text;
        uncachedHashes[key] = hash;
      }
    } catch {
      uncached[key] = text;
      uncachedHashes[key] = hash;
    }
  }

  const uncachedKeys = Object.keys(uncached);
  if (uncachedKeys.length === 0) {
    return { results, translationOk: true };
  }

  // Translate in batches of up to 10
  let allOk = true;
  for (let i = 0; i < uncachedKeys.length; i += 10) {
    const chunkKeys = uncachedKeys.slice(i, i + 10);
    const chunkObj = {};
    chunkKeys.forEach((k) => {
      chunkObj[k] = uncached[k];
    });

    const targetLangName = to === 'mr' ? 'Marathi' : 'English';
    const sourceLangName = from === 'mr' ? 'Marathi' : 'English';

    const prompt =
      `Translate faithfully from ${sourceLangName} to ${targetLangName}. ` +
      `Keep numbers, units, brand names and emojis unchanged. ` +
      (mode === 'transliterate'
        ? `For mode transliterate write the same phonetics/name in ${to === 'mr' ? 'Devanagari' : 'Latin'}, do not translate meaning. `
        : '') +
      `Return JSON object with the exact same keys and translated text values.\nInput: ${JSON.stringify(chunkObj)}`;

    try {
      const translatedJson = await generateJson({
        system: 'You are a professional English-Marathi translator and transliterator for rural Indian e-commerce.',
        user: prompt,
        temperature: 0.1
      });

      for (const k of chunkKeys) {
        const val = translatedJson?.[k];
        if (typeof val === 'string' && val.trim()) {
          results[k] = val.trim();
          // Cache in background
          TranslationCache.updateOne(
            { hash: uncachedHashes[k] },
            { $set: { hash: uncachedHashes[k], result: val.trim() } },
            { upsert: true }
          ).catch(() => {});
        } else {
          results[k] = uncached[k];
          allOk = false;
        }
      }
    } catch {
      // Fallback: keep source text
      chunkKeys.forEach((k) => {
        results[k] = uncached[k];
      });
      allOk = false;
    }
  }

  return { results, translationOk: allOk };
}

/**
 * Ensures { en, mr } object has both fields filled.
 * @param {{ en?: string, mr?: string }} obj
 * @param {'translate' | 'transliterate'} [mode='translate']
 * @returns {Promise<{ en: string, mr: string, translationOk: boolean }>}
 */
export async function ensureBilingual(obj, mode = 'translate') {
  if (!obj) {
    return { en: '', mr: '', translationOk: true };
  }

  let en = (obj.en || '').trim();
  let mr = (obj.mr || '').trim();

  if (en && mr) {
    return { en, mr, translationOk: true };
  }

  if (!en && !mr) {
    return { en: '', mr: '', translationOk: true };
  }

  if (en && !mr) {
    const { results, translationOk } = await translateFields({
      fields: { val: en },
      from: 'en',
      to: 'mr',
      mode
    });
    return {
      en,
      mr: results.val || en,
      translationOk
    };
  }

  if (mr && !en) {
    const { results, translationOk } = await translateFields({
      fields: { val: mr },
      from: 'mr',
      to: 'en',
      mode
    });
    return {
      en: results.val || mr,
      mr,
      translationOk
    };
  }

  return { en, mr, translationOk: true };
}
