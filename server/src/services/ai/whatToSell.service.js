// server/src/services/ai/whatToSell.service.js
import Product from '../../models/Product.js';
import SearchMiss from '../../models/SearchMiss.js';
import { generateJson } from './gemini.client.js';
import { WHAT_TO_SELL_SYSTEM } from '../../config/prompts.js';

const BUDGET_BOUNDS = {
  under_5k: { minPaise: 50000, maxPaise: 500000 },
  '5k_20k': { minPaise: 500000, maxPaise: 2000000 },
  '20k_50k': { minPaise: 2000000, maxPaise: 5000000 },
  above_50k: { minPaise: 5000000, maxPaise: 15000000 }
};

export async function getWhatToSellIdeas({
  sellerProfile,
  resources = ['cooking', 'spare_time'],
  skillsText = '',
  budgetBand = '5k_20k',
  hoursPerDay = 4,
  lang = 'en'
}) {
  const isMr = lang === 'mr';
  const bounds = BUDGET_BOUNDS[budgetBand] || BUDGET_BOUNDS['5k_20k'];

  // 1. Gather real signals
  const [searchMisses, sellerProducts] = await Promise.all([
    SearchMiss.find().sort({ count: -1 }).limit(10).lean(),
    Product.find({ seller: sellerProfile._id }).lean()
  ]);

  const existingCategories = new Set(sellerProducts.map((p) => p.category));
  const topMisses = searchMisses.map((m) => `"${m.query}" (${m.count} searches)`).join(', ');

  const systemPrompt = `${WHAT_TO_SELL_SYSTEM}\nMarket Signals:\n- Popular unfulfilled search terms: ${topMisses || 'Organic honey, Handmade bamboo baskets, Spiced papad'}.\n- Categories already sold by seller: ${Array.from(existingCategories).join(', ') || 'None'}.\n- Budget Band: ${budgetBand}. Hours available per day: ${hoursPerDay}.\n- Available resources: ${resources.join(', ')}. Skills: ${skillsText || 'General traditional crafts/food'}.\nRespond in ${isMr ? 'Marathi' : 'English'}.`;

  try {
    const aiResult = await generateJson({
      system: systemPrompt,
      user: 'Suggest exactly 4 product ideas based on the provided signals and resources.',
      temperature: 0.6
    });

    if (aiResult?.ideas && Array.isArray(aiResult.ideas) && aiResult.ideas.length > 0) {
      return aiResult.ideas.slice(0, 4).map((idea) => ({
        title: idea.title,
        category: idea.category || 'spices-masalas',
        whyItFits: idea.whyItFits,
        demandSignal: idea.demandSignal || 'Identified based on regional platform searches.',
        startupCostMinPaise: bounds.minPaise,
        startupCostMaxPaise: bounds.maxPaise,
        firstStep: idea.firstStep,
        sellingTip: idea.sellingTip
      }));
    }
  } catch (err) {
    console.log('[WhatToSell] AI fallback triggered:', err.message);
  }

  // Deterministic fallback based on search misses & budget band
  const miss1 = searchMisses[0]?.query || 'Handmade Papad';
  const miss2 = searchMisses[1]?.query || 'Wild Forest Honey';

  const fallbackIdeas = [
    {
      title: isMr ? `गावरान ${miss1}` : `Traditional ${miss1}`,
      category: 'snacks-sweets',
      whyItFits: isMr
        ? `तुमच्याकडे उपलब्ध साधनसामग्री आणि वेळ वापरून घरगुती स्नॅक्स बनवणे सोपे आहे.`
        : `Utilizes home cooking setup and spare time without requiring industrial machinery.`,
      demandSignal: isMr
        ? `प्लॅटफॉर्मवर ग्राहकांनी "${miss1}" शोधले आहे.`
        : `Strong customer search interest on the platform for "${miss1}".`,
      startupCostMinPaise: bounds.minPaise,
      startupCostMaxPaise: Math.round(bounds.minPaise * 1.5),
      firstStep: isMr ? 'लहान बॅच तयार करून चव व पॅकिंग तपासा.' : 'Prepare a small test batch of 10-15 units and sample.',
      sellingTip: isMr ? 'पारंपारिक गावाकडची चव अधोरेखित करा.' : 'Highlight traditional wood-fired or sun-dried methods.'
    },
    {
      title: isMr ? `शुद्ध गावरान ${miss2}` : `Natural ${miss2}`,
      category: 'staples-grains',
      whyItFits: isMr
        ? `नैसर्गिक व प्रक्रिया न केलेल्या ग्रामीण उत्पादनांना शहरी ग्राहकांकडून उत्तम मागणी आहे.`
        : `High margin category with minimal processing and long shelf life.`,
      demandSignal: isMr
        ? `ग्राहकांनी ${searchMisses[1]?.count || 12} वेळा शोध घेतला आहे.`
        : `High search volume (${searchMisses[1]?.count || 12} queries) with low local seller competition.`,
      startupCostMinPaise: Math.round(bounds.minPaise * 1.2),
      startupCostMaxPaise: bounds.maxPaise,
      firstStep: isMr ? 'स्थानिक शेतकऱ्यांकडून थेट खरेदी करा.' : 'Source directly from trusted local farmers.',
      sellingTip: isMr ? 'पॅकिंगवर शुद्धतेचे प्रमाणपत्र आणि गावाचे नाव टाका.' : 'Clearly mention the harvesting source and village origin.'
    },
    {
      title: isMr ? 'गावरान हळद व खडे मसाले' : 'Sun-Dried Farm Turmeric & Whole Spices',
      category: 'spices-masalas',
      whyItFits: isMr
        ? `मसाले वर्षभर टिकतात आणि वाहतुकीत खराब होत नाहीत.`
        : `Zero spoilage, high value-to-weight ratio for convenient local delivery.`,
      demandSignal: isMr
        ? `मसाले व घरगुती चटण्या या विभागाला सर्वाधिक नियमित ऑर्डर्स मिळतात.`
        : `Spices category has consistent repeat order volume across all districts.`,
      startupCostMinPaise: bounds.minPaise,
      startupCostMaxPaise: bounds.maxPaise,
      firstStep: isMr ? 'वाळवलेली हळद बारीक दळून पॅक करा.' : 'Pound sun-dried turmeric in traditional mortar.',
      sellingTip: isMr ? 'हळदीमधील नैसर्गिक कुर्कुमिन आणि सुगंधाचा उल्लेख करा.' : 'Highlight chemical-free farming and rich natural aroma.'
    },
    {
      title: isMr ? 'मातीची पारंपरिक भांडी व दिवे' : 'Handcrafted Terracotta Clay Cookware',
      category: 'pottery-clay',
      whyItFits: isMr
        ? `आरोग्यदायी स्वयंपाकासाठी मातीच्या भांड्यांना वाढती पसंती आहे.`
        : `Earthy rural handicraft with strong aesthetic appeal and urban demand.`,
      demandSignal: isMr
        ? `हस्तकला व मातीकाम विभागात कमी विक्रेते असल्याने स्पर्धा कमी आहे.`
        : `Low seller saturation on the platform allows for dominant market share.`,
      startupCostMinPaise: bounds.minPaise,
      startupCostMaxPaise: bounds.maxPaise,
      firstStep: isMr ? '५-१० नमुने तयार करून फोटो अपलोड करा.' : 'Craft 5-10 starter pieces and upload high quality photos.',
      sellingTip: isMr ? 'सुरक्षित बबल रॅप पॅकिंगचे आश्वासन द्या.' : 'Provide protective straw/cardboard packaging guarantee.'
    }
  ];

  return fallbackIdeas;
}
