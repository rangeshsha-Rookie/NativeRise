// server/src/services/ai/growth.service.js
import crypto from 'crypto';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import Review from '../../models/Review.js';
import GrowthReport from '../../models/GrowthReport.js';
import { generateJson } from './gemini.client.js';
import { GROWTH_COACH_SYSTEM } from '../../config/prompts.js';
import { STATIC_TIPS, DETERMINISTIC_FALLBACKS } from '../../config/growthTemplates.js';
import { pick } from '../../utils/pick.js';

function computeFingerprint(stats) {
  const str = JSON.stringify(stats);
  return crypto.createHash('md5').update(str).digest('hex');
}

export async function getGrowthCoachReport({ sellerProfile, refresh = false, lang = 'en' }) {
  const isMr = lang === 'mr';
  const now = new Date();

  // 1. Gather stats
  const [products, deliveredOrders, reviews] = await Promise.all([
    Product.find({ seller: sellerProfile._id }).lean(),
    Order.find({ seller: sellerProfile._id, status: 'DELIVERED' }).lean(),
    Review.find({ seller: sellerProfile._id }).lean()
  ]);

  const hasHistory = deliveredOrders.length > 0 || reviews.length > 0;
  const basis = hasHistory ? 'SELLER' : 'PLATFORM';

  // Compute product sales
  const productSalesMap = {};
  deliveredOrders.forEach((o) => {
    (o.items || []).forEach((it) => {
      const pid = it.product ? it.product.toString() : '';
      productSalesMap[pid] = (productSalesMap[pid] || 0) + it.qty;
    });
  });

  // Candidate rule: Make More
  const makeMoreCandidates = [];
  products.forEach((p) => {
    const pid = p._id.toString();
    const sold = productSalesMap[pid] || 0;
    const rating = p.ratingAvg || p.rating || 4.5;
    if (sold >= 2 || rating >= 4.2) {
      makeMoreCandidates.push({
        productId: pid,
        name: pick(p.name, lang),
        sold,
        rating,
        stock: p.stock
      });
    }
  });

  makeMoreCandidates.sort((a, b) => b.sold - a.sold);
  const topMakeMore = makeMoreCandidates.slice(0, 3);

  // Candidate rule: Improve
  const improveCandidates = [];

  // Check negative review themes
  const themeCounts = {};
  reviews.forEach((r) => {
    if (r.rating <= 3 || r.sentiment === 'negative') {
      (r.themes || []).forEach((t) => {
        themeCounts[t] = (themeCounts[t] || 0) + 1;
      });
    }
  });

  Object.entries(themeCounts).forEach(([theme, count]) => {
    if (count >= 1) {
      improveCandidates.push({
        key: theme,
        type: 'theme',
        count
      });
    }
  });

  // Check slow movers
  products.forEach((p) => {
    const pid = p._id.toString();
    const sold = productSalesMap[pid] || 0;
    if (sold === 0 && p.stock > 10) {
      improveCandidates.push({
        key: 'slow_mover',
        type: 'slow_mover',
        name: pick(p.name, lang),
        stock: p.stock
      });
    }
  });

  const stats = {
    basis,
    totalDelivered: deliveredOrders.length,
    totalReviews: reviews.length,
    productCount: products.length,
    topMakeMore,
    improveCandidates
  };

  const fingerprint = computeFingerprint(stats);

  // Check cached report
  if (!refresh) {
    const cached = await GrowthReport.findOne({
      seller: sellerProfile._id,
      lang: isMr ? 'mr' : 'en',
      fingerprint
    }).lean();

    if (cached && cached.content) {
      return cached.content;
    }
  }

  // Attempt Gemini AI Generation
  let aiContent = null;
  try {
    const prompt = `Facts about this seller:\n- Total delivered orders: ${deliveredOrders.length}.\n- Reviews: ${reviews.length}.\n- High demand products: ${topMakeMore.map((m) => `${m.name} (${m.sold} units, ${m.rating} stars)`).join(', ') || 'General category items'}.\n- Improvement areas: ${improveCandidates.map((i) => i.key).join(', ') || 'Maintain prompt delivery'}.\nRespond in ${isMr ? 'Marathi' : 'English'}. Return JSON with: summary (string), makeMore (array of { productId, title, why, action }), improve (array of { key, title, why, action }), tip (string).`;

    const res = await generateJson({
      system: GROWTH_COACH_SYSTEM,
      user: prompt,
      temperature: 0.2
    });

    if (res && res.summary && Array.isArray(res.makeMore)) {
      aiContent = {
        basis,
        aiGenerated: true,
        summary: res.summary,
        makeMore: res.makeMore,
        improve: res.improve || [],
        tip: res.tip || (isMr ? STATIC_TIPS.mr[0] : STATIC_TIPS.en[0])
      };
    }
  } catch (err) {
    console.log('[GrowthCoach] AI generation failed, using deterministic card:', err.message);
  }

  // Deterministic Assembly
  if (!aiContent) {
    const makeMoreItems = topMakeMore.map((m) =>
      DETERMINISTIC_FALLBACKS.makeMore[isMr ? 'mr' : 'en'](m.name, m.sold, m.rating)
    );

    if (makeMoreItems.length === 0) {
      makeMoreItems.push({
        title: isMr ? 'लोकप्रिय गावरान उत्पादनांचा स्टॉक वाढवा' : 'Stock up on traditional staples',
        why: isMr ? 'ग्राहकांकडून गावरान पदार्थांना सर्वाधिक पसंती मिळत आहे.' : 'Regional buyers seek authentic village-made foods.',
        action: isMr ? 'ताज्या पदार्थांची नवीन बॅच तयार करा.' : 'Prepare a fresh batch of seasonal products.'
      });
    }

    const improveItems = improveCandidates.slice(0, 3).map((imp) => {
      if (imp.type === 'theme') {
        return DETERMINISTIC_FALLBACKS.improveReviewTheme[isMr ? 'mr' : 'en'](imp.key, imp.count);
      }
      return DETERMINISTIC_FALLBACKS.improveSlowMover[isMr ? 'mr' : 'en'](imp.name, imp.stock);
    });

    if (improveItems.length === 0) {
      improveItems.push({
        key: 'packaging',
        title: isMr ? 'सुरक्षित पॅकिंगची खात्री करा' : 'Maintain safe packaging',
        why: isMr ? 'वाहतुकीदरम्यान वस्तू सुरक्षित राहणे आवश्यक आहे.' : 'Proper sealing prevents delivery damage.',
        action: isMr ? 'द्रवरूप व तेलाच्या पदार्थांसाठी डबल सील वापरा.' : 'Double-tape liquid jars to ensure zero transit leakage.'
      });
    }

    const tips = isMr ? STATIC_TIPS.mr : STATIC_TIPS.en;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    aiContent = {
      basis,
      aiGenerated: false,
      summary: isMr
        ? `तुमच्या दुकानात एकूण ${deliveredOrders.length} ऑर्डर्स पूर्ण झाल्या आहेत. विक्रीचा वेग चांगला असून काही महत्त्वाच्या सुधारणा खाली दिल्या आहेत.`
        : `Your shop has fulfilled ${deliveredOrders.length} orders. Demand is healthy across popular items; see actionable guidance below.`,
      makeMore: makeMoreItems,
      improve: improveItems,
      tip: randomTip
    };
  }

  // Cache report
  await GrowthReport.findOneAndUpdate(
    { seller: sellerProfile._id, lang: isMr ? 'mr' : 'en' },
    {
      $set: {
        fingerprint,
        content: aiContent,
        stats,
        generatedAt: now
      }
    },
    { upsert: true, new: true }
  );

  return aiContent;
}
