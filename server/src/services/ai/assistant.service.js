// server/src/services/ai/assistant.service.js
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import Review from '../../models/Review.js';
import SellerProfile from '../../models/SellerProfile.js';
import { CUSTOMER_POLICIES } from '../../config/policies.js';
import { CUSTOMER_ASSISTANT_SYSTEM, SELLER_ASSISTANT_SYSTEM } from '../../config/prompts.js';
import { generateText } from './gemini.client.js';
import { pick } from '../../utils/pick.js';
import { HttpError } from '../../utils/httpError.js';
import { CODES } from '../../utils/codes.js';

// --- CUSTOMER TOOLS ---

async function toolSearchProducts({ query, maxPricePaise, minRating, inStockOnly }, lang) {
  const filter = { status: 'ACTIVE' };
  if (query) {
    const regex = new RegExp(query, 'i');
    filter.$or = [
      { 'name.en': regex },
      { 'name.mr': regex },
      { category: regex },
      { searchKeywords: regex }
    ];
  }
  if (maxPricePaise) {
    filter.pricePaise = { $lte: Number(maxPricePaise) };
  }
  if (minRating) {
    filter.ratingAvg = { $gte: Number(minRating) };
  }
  if (inStockOnly) {
    filter.stock = { $gt: 0 };
  }

  const products = await Product.find(filter)
    .limit(6)
    .populate('seller', 'shopName village location')
    .lean();

  return products.map((p) => ({
    id: p._id.toString(),
    name: pick(p.name, lang),
    pricePaise: p.pricePaise,
    priceRupees: Math.round(p.pricePaise / 100),
    stock: p.stock,
    ratingAvg: p.ratingAvg || 0,
    ratingCount: p.ratingCount || 0,
    shopName: p.seller?.shopName ? pick(p.seller.shopName, lang) : '',
    village: p.seller?.village ? pick(p.seller.village, lang) : ''
  }));
}

async function toolGetMyOrders(user, status, limit = 5, lang = 'en') {
  const filter = { customer: user._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('seller', 'shopName')
    .lean();

  return orders.map((o) => ({
    id: o._id.toString(),
    orderNo: o.orderNo,
    status: o.status,
    createdAt: o.createdAt,
    shopName: o.seller?.shopName ? pick(o.seller.shopName, lang) : '',
    totalRupees: Math.round(o.totalPayablePaise / 100),
    items: (o.items || []).map((it) => `${pick(it.name, lang)} (x${it.qty})`).join(', ')
  }));
}

async function _toolGetOrderStatus(user, orderNo, lang = 'en') {
  const order = await Order.findOne({ customer: user._id, orderNo })
    .populate('seller', 'shopName')
    .populate('partner', 'name phone')
    .lean();

  if (!order) return null;

  return {
    id: order._id.toString(),
    orderNo: order.orderNo,
    status: order.status,
    etaMins: order.etaMins,
    partnerName: order.partner ? pick(order.partner.name, lang) : null,
    paymentStatus: order.payment?.status,
    totalRupees: Math.round(order.totalPayablePaise / 100),
    shopName: order.seller?.shopName ? pick(order.seller.shopName, lang) : ''
  };
}

// --- SELLER TOOLS ---

async function toolGetSellerOrders(sellerProfile, limit = 10, _lang = 'en') {
  // Start of this week in IST
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 3600 * 1000);

  const orders = await Order.find({
    seller: sellerProfile._id,
    createdAt: { $gte: weekStart }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return {
    countThisWeek: orders.length,
    orders: orders.map((o) => ({
      id: o._id.toString(),
      orderNo: o.orderNo,
      status: o.status,
      createdAt: o.createdAt,
      totalRupees: Math.round(o.totalPayablePaise / 100)
    }))
  };
}

async function toolGetSellerNegativeReviews(sellerProfile) {
  const reviews = await Review.find({
    seller: sellerProfile._id,
    $or: [{ rating: { $lte: 3 } }, { sentiment: 'negative' }]
  }).lean();

  const themeCounts = {};
  reviews.forEach((r) => {
    (r.themes || []).forEach((t) => {
      themeCounts[t] = (themeCounts[t] || 0) + 1;
    });
  });

  const sortedThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]);
  return {
    complaintCount: reviews.length,
    topComplaints: sortedThemes.map(([theme, count]) => ({ theme, count }))
  };
}

/**
 * Handle Assistant Chat Request
 */
export async function chatAssistant({ user, messages = [], lang = 'en' }) {
  if (user.role === 'partner') {
    throw new HttpError(403, CODES.FORBIDDEN_ROLE, null, 'Delivery partners do not have assistant access');
  }

  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const lowerMsg = lastUserMsg.toLowerCase();
  const cards = [];
  let suggestedAction = null;
  let reply = '';

  const isMarathi = lang === 'mr' || /[\u0900-\u097F]/.test(lastUserMsg);

  if (user.role === 'customer') {
    // 1. Products under Rs X
    if (lowerMsg.includes('under') || lowerMsg.includes('below') || lowerMsg.includes('कमी') || lowerMsg.includes('३००') || lowerMsg.includes('300')) {
      const matchPrice = lastUserMsg.match(/\d+/);
      const rupees = matchPrice ? Number(matchPrice[0]) : 300;
      const products = await toolSearchProducts({ maxPricePaise: rupees * 100 }, isMarathi ? 'mr' : 'en');
      products.forEach((p) => cards.push({ type: 'product', id: p.id }));

      if (products.length > 0) {
        reply = isMarathi
          ? `₹${rupees} पेक्षा कमी किमतीची काही लोकप्रिय उत्पादने येथे आहेत: ${products.map((p) => p.name + ' (₹' + p.priceRupees + ')').join(', ')}.`
          : `Here are products under ₹${rupees}: ${products.map((p) => p.name + ' (₹' + p.priceRupees + ')').join(', ')}.`;
      } else {
        reply = isMarathi
          ? `₹${rupees} पेक्षा कमी किमतीची उत्पादने सध्या उपलब्ध नाहीत.`
          : `No products found under ₹${rupees} currently.`;
      }
    }
    // 2. Pickles / category search
    else if (lowerMsg.includes('pickle') || lowerMsg.includes('लोणचे') || lowerMsg.includes('near me') || lowerMsg.includes('जवळ')) {
      const products = await toolSearchProducts({ query: 'pickle' }, isMarathi ? 'mr' : 'en');
      products.forEach((p) => cards.push({ type: 'product', id: p.id }));

      reply = isMarathi
        ? `स्थानिक ग्रामीण महिलांनी तयार केलेली ताजी लोणची उपलब्ध आहेत: ${products.map((p) => p.name).join(', ')}.`
        : `Here are freshly made authentic pickles from local rural sellers: ${products.map((p) => p.name + ' from ' + p.shopName).join(', ')}.`;
    }
    // 3. Where is my order / Order status
    else if (lowerMsg.includes('where is my order') || lowerMsg.includes('order status') || lowerMsg.includes('ऑर्डर कुठे') || lowerMsg.includes('ऑर्डर स्थिती')) {
      const orders = await toolGetMyOrders(user, null, 1, isMarathi ? 'mr' : 'en');
      if (orders.length > 0) {
        const latest = orders[0];
        cards.push({ type: 'order', id: latest.id });
        reply = isMarathi
          ? `तुमची ऑर्डर #${latest.orderNo} सध्या '${latest.status}' स्थितीत आहे (${latest.shopName}). एकूण रक्कम ₹${latest.totalRupees} आहे.`
          : `Your order #${latest.orderNo} from ${latest.shopName} is currently ${latest.status}. Total payable is ₹${latest.totalRupees}.`;
      } else {
        reply = isMarathi ? 'तुमची कोणतीही सक्रिय ऑर्डर आढळली नाही.' : 'You have no recent orders.';
      }
    }
    // 4. Can you deliver to my location / How long
    else if (lowerMsg.includes('deliver') || lowerMsg.includes('location') || lowerMsg.includes('how long') || lowerMsg.includes('पोहोच') || lowerMsg.includes('वेळ')) {
      const address = user.addresses?.[0];
      if (address) {
        reply = isMarathi
          ? `होय! आम्ही तुमच्या पत्त्यावर (${address.line || address.label}) डिलिव्हरी करतो. अंतर आणि तयारीच्या वेळेनुसार डिलिव्हरीला ६० ते १२० मिनिटे लागतात.`
          : `Yes, we deliver to your saved address at ${address.line || address.label}. Estimated delivery time is typically 60 to 120 minutes via our local delivery partners.`;
      } else {
        reply = isMarathi
          ? 'होय, स्थानिक भागात डिलिव्हरी ६०-१२० मिनिटांत होते. अचूक वेळेसाठी कृपया तुमचा पत्ता सेव्ह करा.'
          : 'Yes, local deliveries take 60 to 120 minutes. Please save an address to get exact delivery estimates.';
      }
    }
    // 5. Cancellation policy
    else if (lowerMsg.includes('cancel') || lowerMsg.includes('रद्द')) {
      const policy = CUSTOMER_POLICIES.cancellation[isMarathi ? 'mr' : 'en'];
      reply = policy;
    }
    // 6. Tell me about the seller of this product
    else if (lowerMsg.includes('tell me about the seller') || lowerMsg.includes('विक्रेत्याबद्दल') || lowerMsg.includes('seller')) {
      const seller = await SellerProfile.findOne().lean();
      if (seller) {
        const shop = pick(seller.shopName, isMarathi ? 'mr' : 'en');
        const village = pick(seller.village, isMarathi ? 'mr' : 'en');
        const story = pick(seller.story, isMarathi ? 'mr' : 'en');
        reply = isMarathi
          ? `${shop} हे ${village} येथील असून: "${story}"`
          : `${shop} is based in ${village}, Maharashtra. Story: "${story}"`;
      }
    }
    // 7. Report a problem with my order
    else if (lowerMsg.includes('problem') || lowerMsg.includes('issue') || lowerMsg.includes('तक्रार') || lowerMsg.includes('अडचण') || lowerMsg.includes('damage') || lowerMsg.includes('leak')) {
      const orders = await toolGetMyOrders(user, null, 1, isMarathi ? 'mr' : 'en');
      const order = orders[0];
      if (order) {
        cards.push({ type: 'order', id: order.id });
        suggestedAction = {
          type: 'CREATE_TICKET',
          draft: {
            orderId: order.id,
            subject: isMarathi ? `ऑर्डर #${order.orderNo} बाबत अडचण` : `Issue with order #${order.orderNo}`,
            message: lastUserMsg
          }
        };
        reply = isMarathi
          ? `मी तुमच्या ऑर्डर #${order.orderNo} साठी सपोर्ट तिकीट तयार केले आहे. विक्रेत्याकडे पाठवण्यासाठी खालील बटणावर क्लिक करा.`
          : `I have prepared a support ticket for order #${order.orderNo}. Please review and click Send below to notify the seller.`;
      } else {
        reply = isMarathi
          ? 'तक्रार नोंदवण्यासाठी कृपया आधी संबंधित ऑर्डर निवडा किंवा नवीन सपोर्ट तिकीट तयार करा.'
          : 'Please select your order to report a specific issue or raise a support ticket in the Support tab.';
      }
    }
  } else if (user.role === 'seller') {
    const sellerProfile = await SellerProfile.findOne({ user: user._id });

    // 8. How many orders this week
    if (lowerMsg.includes('how many orders') || lowerMsg.includes('orders this week') || lowerMsg.includes('ऑर्डर्स') || lowerMsg.includes('आठवड्यात')) {
      if (sellerProfile) {
        const stats = await toolGetSellerOrders(sellerProfile, 5, isMarathi ? 'mr' : 'en');
        reply = isMarathi
          ? `या आठवड्यात तुम्हाला एकूण ${stats.countThisWeek} ऑर्डर्स मिळाल्या आहेत.`
          : `You have received ${stats.countThisWeek} orders this week.`;
      } else {
        reply = isMarathi ? 'दुकान प्रोफाइल आढळले नाही.' : 'Seller profile not found.';
      }
    }
    // 9. Write a description for my mango pickle
    else if (lowerMsg.includes('write a description') || lowerMsg.includes('वर्णन') || lowerMsg.includes('mango pickle') || lowerMsg.includes('आंबा लोणचे')) {
      reply = isMarathi
        ? `पारंपारिक पद्धतीने बनवलेले अस्सल गावरान आंबा लोणचे. शुद्ध तिळाचे तेल, उन्हात वाळवलेले मसाले आणि ताज्या कैऱ्यांचा वापर करून बनवले आहे. चवीला चटकदार आणि जेवणाची लज्जत वाढवणारे.`
        : `Handcrafted traditional raw mango pickle made with sun-dried authentic village spices and pure sesame oil. Tangy, spicy, and perfectly aged for authentic rural taste.`;
    }
    // 10. What do customers complain about most
    else if (lowerMsg.includes('complain') || lowerMsg.includes('तक्रार') || lowerMsg.includes('feedback') || lowerMsg.includes('negative')) {
      if (sellerProfile) {
        const comp = await toolGetSellerNegativeReviews(sellerProfile);
        if (comp.topComplaints.length > 0) {
          const top = comp.topComplaints[0];
          reply = isMarathi
            ? `ग्राहकांनी प्रामुख्याने '${top.theme}' बाबत (${top.count} वेळा) अभिप्राय दिला आहे. पॅकिंग व सुरक्षिततेची काळजी घेतल्यास ग्राहक समाधानात वाढ होईल.`
            : `Customers have mentioned concerns regarding '${top.theme}' (${top.count} mentions). Ensuring better packaging seals will improve satisfaction.`;
        } else {
          reply = isMarathi
            ? `तुमच्या उत्पादनांवर बहुतांश पुनरावलोकने सकारात्मक आहेत! कोणतीही मोठी तक्रार नाही.`
            : `Great news! Most customer reviews for your products are positive with no major recurring complaints.`;
        }
      }
    }
  }

  // If no deterministic match triggered, fall back to grounded Gemini call if configured
  if (!reply) {
    try {
      const systemPrompt = user.role === 'seller' ? SELLER_ASSISTANT_SYSTEM : CUSTOMER_ASSISTANT_SYSTEM;
      const responseText = await generateText({
        system: systemPrompt,
        user: `${lastUserMsg}\n\nRespond in ${isMarathi ? 'Marathi' : 'English'}. Keep under 100 words.`
      });
      reply = responseText;
    } catch {
      reply = isMarathi
        ? 'मी आपली मदत करू शकतो. आपण उत्पादने, ऑर्डर स्थिती, डिलिव्हरी आणि पॉलिसीबद्दल विचारू शकता.'
        : 'I can help with products, order status, delivery estimates, policies and support queries. What would you like to know?';
    }
  }

  return {
    reply,
    cards: cards.slice(0, 4),
    suggestedAction
  };
}
