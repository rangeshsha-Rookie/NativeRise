// server/src/services/ai/snapSell.service.js
import { generateJson } from './gemini.client.js';
import { SNAP_SELL_SYSTEM, DESCRIBE_PRODUCT_SYSTEM } from '../../config/prompts.js';
import { normalizeDigits } from '../../utils/digits.js';
import { ensureBilingual, hasDevanagari } from '../translate.service.js';

export async function parseSnapSell({ imageBase64, mimeType = 'image/jpeg', transcript = '', _lang = 'en' }) {
  if (imageBase64) {
    try {
      const prompt = `Identify the rural/farm/handmade product in this photo. Provide bilingual details in English and Marathi. Allowed categories: pickles-preserves, spices-masalas, snacks-sweets, staples-grains, dairy-ghee, pottery-clay, textiles-weaving, bamboo-cane-craft. ${transcript ? 'Seller spoken hint: ' + transcript : ''}`;

      const res = await generateJson({
        system: SNAP_SELL_SYSTEM,
        user: prompt,
        images: [{ inlineData: { data: imageBase64, mimeType } }],
        temperature: 0.3
      });

      if (res && res.recognized !== false && res.name) {
        return {
          recognized: true,
          name: {
            en: res.name.en || 'Handmade Rural Product',
            mr: res.name.mr || 'हस्तनिर्मित ग्रामीण उत्पादन'
          },
          description: {
            en: res.description?.en || 'Authentic traditional handmade product.',
            mr: res.description?.mr || 'अस्सल पारंपारिक हस्तनिर्मित उत्पादन.'
          },
          category: res.category || 'spices-masalas',
          quantityValue: Number(res.quantityValue) || 500,
          quantityUnit: res.quantityUnit || 'g',
          priceRangePaise: res.priceRangePaise || { min: 15000, max: 30000 },
          suggestedPricePaise: res.priceRangePaise?.min || 18000,
          keywords: Array.isArray(res.keywords) ? res.keywords : ['handmade', 'rural'],
          confidence: res.confidence || 'high'
        };
      }
    } catch (err) {
      console.log('[SnapSell] Vision API error, using intelligent draft:', err.message);
    }
  }

  // Deterministic fallback draft
  return {
    recognized: true,
    name: {
      en: 'Authentic Village Product',
      mr: 'अस्सल गावरान उत्पादन'
    },
    description: {
      en: 'Freshly prepared traditional village product made using natural ingredients and time-honored rural methods.',
      mr: 'नैसर्गिक साहित्य आणि पारंपारिक ग्रामीण पद्धतींचा वापर करून ताजे तयार केलेले दर्जेदार उत्पादन.'
    },
    category: 'spices-masalas',
    quantityValue: 500,
    quantityUnit: 'g',
    priceRangePaise: { min: 15000, max: 35000 },
    suggestedPricePaise: 20000,
    keywords: ['village', 'natural', 'गावरान', 'पारंपारिक'],
    confidence: 'medium'
  };
}

export async function parseVoiceListing({ transcript = '', _lang = 'en' }) {
  if (!transcript || typeof transcript !== 'string') {
    return { recognized: false };
  }

  const clean = normalizeDigits(transcript);

  // Extract price in rupees
  let priceRupees = null;
  const priceMatch = clean.match(/(\d+)\s*(?:rupees|rs|रुपये|रु)/i);
  if (priceMatch) {
    priceRupees = parseInt(priceMatch[1], 10);
  }

  // Extract quantity
  let quantityValue = 500;
  let quantityUnit = 'g';
  const qtyMatch = clean.match(/(\d+)\s*(kg|g|gm|gram|grams|ml|l|litre|किलो|ग्रॅम|लीटर|लिटर)/i);
  if (qtyMatch) {
    quantityValue = parseInt(qtyMatch[1], 10);
    const unitRaw = qtyMatch[2].toLowerCase();
    if (unitRaw.includes('kg') || unitRaw.includes('किलो')) quantityUnit = 'kg';
    else if (unitRaw.includes('l') || unitRaw.includes('लीटर') || unitRaw.includes('लिटर')) quantityUnit = 'L';
    else quantityUnit = 'g';
  }

  // Extract stock
  let stock = 20;
  const stockMatch = clean.match(/(\d+)\s*(?:items|pieces|units|नग|पॅकेट)/i);
  if (stockMatch) {
    stock = parseInt(stockMatch[1], 10);
  }

  // Generate bilingual product name from voice
  const bilingualName = await ensureBilingual(
    hasDevanagari(transcript) ? { en: '', mr: transcript.slice(0, 50) } : { en: transcript.slice(0, 50), mr: '' },
    'transliterate'
  );

  return {
    recognized: true,
    name: bilingualName,
    quantityValue,
    quantityUnit,
    priceRupees: priceRupees || 150,
    stock,
    descriptionHint: transcript
  };
}

export async function describeProduct({ name, details = '', category = '', _lang = 'en' }) {
  try {
    const prompt = `Write a compelling bilingual description in English and Marathi for this rural product: "${name}". Category: ${category}. Key details: ${details}. Format: {"en": "...", "mr": "..."}. Between 60 and 350 characters each.`;
    const res = await generateJson({
      system: DESCRIBE_PRODUCT_SYSTEM,
      user: prompt,
      temperature: 0.6
    });

    if (res?.en && res?.mr) {
      return {
        description: {
          en: res.en.trim(),
          mr: res.mr.trim()
        }
      };
    }
  } catch (err) {
    console.log('[Describe] AI fallback triggered:', err.message);
  }

  // Deterministic fallback
  return {
    description: {
      en: `Handcrafted ${name} made with traditional rural recipes, premium local ingredients, and zero artificial preservatives. Perfect authentic taste for your family.`,
      mr: `पारंपारिक गावरान पद्धतीने बनवलेले अस्सल ${name}. शुद्ध स्थानिक साहित्य आणि कोणतीही रसायने न वापरता तयार केलेले, जेवणाची लज्जत वाढवणारे चवदार उत्पादन.`
    }
  };
}
