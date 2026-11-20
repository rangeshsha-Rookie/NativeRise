// server/src/controllers/seller.controller.js
import SellerProfile from '../models/SellerProfile.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import SupportTicket from '../models/SupportTicket.js';
import LedgerEntry from '../models/LedgerEntry.js';
import { transition } from '../services/orders.service.js';
import { getSellerEarnings } from '../services/ledger.service.js';
import { ensureBilingual, hasDevanagari } from '../services/translate.service.js';
import { uploadImageBuffer } from '../services/cloudinary.service.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { pick } from '../utils/pick.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

function toBilingualInput(val) {
  if (!val) return { en: '', mr: '' };
  if (typeof val === 'object' && (val.en || val.mr)) {
    return { en: val.en || '', mr: val.mr || '' };
  }
  const str = String(val).trim();
  return hasDevanagari(str) ? { en: '', mr: str } : { en: str, mr: '' };
}

/**
 * GET /seller/shop
 */
export async function getShop(req, res) {
  const seller = req.sellerProfile;
  res.json({
    id: seller._id.toString(),
    shopName: pick(seller.shopName, req.lang),
    shopNameAll: seller.shopName,
    story: pick(seller.story, req.lang),
    storyAll: seller.story,
    village: pick(seller.village, req.lang),
    villageAll: seller.village,
    district: seller.district,
    state: seller.state,
    pincode: seller.pincode,
    location: seller.location,
    maxDeliveryKm: seller.maxDeliveryKm,
    prepTimeMins: seller.prepTimeMins,
    minOrderPaise: seller.minOrderPaise,
    deliveryMode: seller.deliveryMode,
    isAcceptingOrders: seller.isAcceptingOrders,
    photoUrl: seller.photoUrl,
    coverUrl: seller.coverUrl,
    ratingAvg: seller.ratingAvg,
    ratingCount: seller.ratingCount
  });
}

/**
 * PUT /seller/shop
 */
export async function updateShop(req, res, next) {
  try {
    const seller = await SellerProfile.findById(req.sellerProfile._id);
    const {
      shopName,
      story,
      village,
      district,
      state,
      pincode,
      location,
      maxDeliveryKm,
      prepTimeMins,
      minOrderPaise,
      deliveryMode,
      isAcceptingOrders,
      photoUrl,
      coverUrl
    } = req.body;

    if (shopName) {
      seller.shopName = await ensureBilingual(toBilingualInput(shopName), 'transliterate');
    }
    if (village) {
      seller.village = await ensureBilingual(toBilingualInput(village), 'transliterate');
    }
    if (story) {
      seller.story = await ensureBilingual(toBilingualInput(story), 'translate');
    }
    if (district) seller.district = district;
    if (state) seller.state = state;
    if (pincode) seller.pincode = pincode;
    if (location) seller.location = location;
    if (maxDeliveryKm !== undefined) seller.maxDeliveryKm = maxDeliveryKm;
    if (prepTimeMins !== undefined) seller.prepTimeMins = prepTimeMins;
    if (minOrderPaise !== undefined) seller.minOrderPaise = minOrderPaise;
    if (deliveryMode) seller.deliveryMode = deliveryMode;
    if (isAcceptingOrders !== undefined) seller.isAcceptingOrders = isAcceptingOrders;
    if (photoUrl !== undefined) seller.photoUrl = photoUrl;
    if (coverUrl !== undefined) seller.coverUrl = coverUrl;

    await seller.save();

    res.json({
      id: seller._id.toString(),
      shopName: pick(seller.shopName, req.lang),
      shopNameAll: seller.shopName,
      story: pick(seller.story, req.lang),
      storyAll: seller.story,
      village: pick(seller.village, req.lang),
      villageAll: seller.village,
      district: seller.district,
      state: seller.state,
      pincode: seller.pincode,
      location: seller.location,
      maxDeliveryKm: seller.maxDeliveryKm,
      prepTimeMins: seller.prepTimeMins,
      minOrderPaise: seller.minOrderPaise,
      deliveryMode: seller.deliveryMode,
      isAcceptingOrders: seller.isAcceptingOrders,
      photoUrl: seller.photoUrl,
      coverUrl: seller.coverUrl
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /seller/upload/image (or /uploads/image)
 */
export async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      throw new HttpError(400, CODES.UPLOAD_FAILED, null, 'No file uploaded');
    }

    const sellerId = req.sellerProfile?._id?.toString() || 'common';
    const folder = `nativerise/${sellerId}`;

    const result = await uploadImageBuffer(req.file.buffer, folder);
    res.json({ url: result.url });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /seller/dashboard
 */
export async function getDashboard(req, res, next) {
  try {
    const sellerId = req.sellerProfile._id;
    const lang = req.lang || 'en';
    const now = new Date();

    // Start of today IST (UTC+5:30)
    const istOffsetMs = 5.5 * 3600 * 1000;
    const nowIst = new Date(now.getTime() + istOffsetMs);
    const startOfTodayIst = new Date(
      Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate()) - istOffsetMs
    );
    const startOfWeekIst = new Date(startOfTodayIst.getTime() - 6 * 24 * 3600 * 1000);

    const [
      newOrders,
      activeOrders,
      deliveredToday,
      deliveredThisWeek,
      earningsThisWeekDocs,
      earningsTotalDocs,
      lowStockDocs,
      recentReviewsDocs,
      openTickets
    ] = await Promise.all([
      Order.countDocuments({ seller: sellerId, status: 'PLACED' }),
      Order.countDocuments({
        seller: sellerId,
        status: { $in: ['ACCEPTED', 'PACKED', 'ASSIGNED', 'PICKED_UP'] }
      }),
      Order.countDocuments({ seller: sellerId, status: 'DELIVERED', updatedAt: { $gte: startOfTodayIst } }),
      Order.countDocuments({ seller: sellerId, status: 'DELIVERED', updatedAt: { $gte: startOfWeekIst } }),
      LedgerEntry.find({
        user: req.user._id,
        role: 'seller',
        type: 'SELLER_EARNING',
        createdAt: { $gte: startOfWeekIst }
      }).lean(),
      LedgerEntry.find({
        user: req.user._id,
        role: 'seller',
        type: 'SELLER_EARNING'
      }).lean(),
      Product.find({ seller: sellerId, status: 'ACTIVE', stock: { $lte: 5 } }).lean(),
      Review.find({ seller: sellerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('product', 'name')
        .populate('customer', 'name')
        .lean(),
      SupportTicket.countDocuments({ seller: sellerId, status: { $in: ['OPEN', 'IN_PROGRESS'] } })
    ]);

    const netEarningsThisWeekPaise = earningsThisWeekDocs.reduce(
      (sum, e) => sum + (e.amountPaise || 0),
      0
    );
    const netEarningsTotalPaise = earningsTotalDocs.reduce(
      (sum, e) => sum + (e.amountPaise || 0),
      0
    );

    const pendingActions = [];
    if (newOrders > 0) {
      pendingActions.push({ type: 'NEW_ORDERS', count: newOrders });
    }
    if (openTickets > 0) {
      pendingActions.push({ type: 'OPEN_TICKETS', count: openTickets });
    }
    if (lowStockDocs.length > 0) {
      pendingActions.push({ type: 'LOW_STOCK', count: lowStockDocs.length });
    }

    res.json({
      newOrders,
      activeOrders,
      deliveredToday,
      deliveredThisWeek,
      netEarningsThisWeekPaise,
      netEarningsTotalPaise,
      lowStock: lowStockDocs.map((p) => ({
        productId: p._id.toString(),
        name: pick(p.name, lang),
        stock: p.stock
      })),
      recentReviews: recentReviewsDocs.map((r) => ({
        id: r._id.toString(),
        productName: r.product ? pick(r.product.name, lang) : '',
        rating: r.rating,
        text: pick(r.text, lang),
        createdAt: r.createdAt
      })),
      ratingAvg: req.sellerProfile.ratingAvg || 0,
      ratingCount: req.sellerProfile.ratingCount || 0,
      openTickets,
      pendingActions
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /seller/products
 */
export async function getSellerProducts(req, res, next) {
  try {
    const sellerId = req.sellerProfile._id;
    const lang = req.lang || 'en';
    const { status, q } = req.query;
    const { page, pageSize, skip, limit } = parsePagination(req.query);

    const filter = { seller: sellerId };
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'ARCHIVED' };
    }

    if (q && q.trim()) {
      const rgx = new RegExp(q.trim(), 'i');
      filter.$or = [{ 'name.en': rgx }, { 'name.mr': rgx }, { searchKeywords: rgx }];
    }

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort({ createdAt: -1 }).skip(skip) .limit(limit).lean()
    ]);

    const items = products.map((p) => ({
      id: p._id.toString(),
      code: p.code || '',
      name: pick(p.name, lang),
      nameAll: p.name,
      description: pick(p.description, lang),
      descriptionAll: p.description,
      category: p.category,
      pricePaise: p.pricePaise,
      quantityValue: p.quantityValue,
      quantityUnit: p.quantityUnit,
      stock: p.stock,
      images: p.images || [],
      status: p.status,
      soldCount: p.soldCount || 0,
      ratingAvg: p.ratingAvg || 0,
      ratingCount: p.ratingCount || 0
    }));

    res.json({
      items,
      meta: buildPaginationMeta(total, page, pageSize)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /seller/products
 */
export async function createProduct(req, res, next) {
  try {
    const seller = req.sellerProfile;
    const lang = req.lang || 'en';
    const {
      category,
      name,
      description,
      pricePaise,
      quantityValue,
      quantityUnit,
      stock,
      images,
      searchKeywords = []
    } = req.body;

    // Check shop complete
    if (!seller.shopName?.en || !seller.location?.lat) {
      throw new HttpError(400, CODES.SHOP_INCOMPLETE, null, 'Complete your shop profile before adding products');
    }

    const bilingualName = await ensureBilingual(toBilingualInput(name), 'transliterate');
    const bilingualDesc = await ensureBilingual(toBilingualInput(description), 'translate');

    // Build searchKeywords
    const allKeywords = Array.from(
      new Set(
        [
          bilingualName.en.toLowerCase(),
          bilingualName.mr,
          category,
          ...searchKeywords.map((k) => k.toLowerCase())
        ].filter(Boolean)
      )
    );

    const product = await Product.create({
      seller: seller._id,
      category,
      name: bilingualName,
      description: bilingualDesc,
      pricePaise,
      quantityValue,
      quantityUnit,
      stock,
      images: images || [],
      searchKeywords: allKeywords,
      status: 'ACTIVE'
    });

    res.status(201).json({
      id: product._id.toString(),
      name: pick(product.name, lang),
      nameAll: product.name,
      description: pick(product.description, lang),
      descriptionAll: product.description,
      category: product.category,
      pricePaise: product.pricePaise,
      quantityValue: product.quantityValue,
      quantityUnit: product.quantityUnit,
      stock: product.stock,
      images: product.images,
      status: product.status
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /seller/products/:id
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findOne({
      _id: id,
      seller: req.sellerProfile._id
    }).lean();

    if (!product) {
      throw new HttpError(404, CODES.PRODUCT_NOT_FOUND, null, 'Product not found');
    }

    res.json({
      id: product._id.toString(),
      name: pick(product.name, req.lang),
      nameAll: product.name,
      description: pick(product.description, req.lang),
      descriptionAll: product.description,
      category: product.category,
      pricePaise: product.pricePaise,
      quantityValue: product.quantityValue,
      quantityUnit: product.quantityUnit,
      stock: product.stock,
      images: product.images || [],
      status: product.status,
      searchKeywords: product.searchKeywords || []
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /seller/products/:id
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const lang = req.lang || 'en';
    const product = await Product.findOne({ _id: id, seller: req.sellerProfile._id });

    if (!product) {
      throw new HttpError(404, CODES.PRODUCT_NOT_FOUND, null, 'Product not found');
    }

    const {
      name,
      description,
      category,
      pricePaise,
      quantityValue,
      quantityUnit,
      stock,
      images,
      searchKeywords
    } = req.body;

    if (name) {
      product.name = await ensureBilingual(toBilingualInput(name), 'transliterate');
    }
    if (description) {
      product.description = await ensureBilingual(toBilingualInput(description), 'translate');
    }
    if (category) product.category = category;
    if (pricePaise !== undefined) product.pricePaise = pricePaise;
    if (quantityValue !== undefined) product.quantityValue = quantityValue;
    if (quantityUnit) product.quantityUnit = quantityUnit;
    if (stock !== undefined) product.stock = stock;
    if (images) product.images = images;
    if (searchKeywords) product.searchKeywords = searchKeywords;

    await product.save();

    res.json({
      id: product._id.toString(),
      name: pick(product.name, lang),
      nameAll: product.name,
      description: pick(product.description, lang),
      descriptionAll: product.description,
      category: product.category,
      pricePaise: product.pricePaise,
      quantityValue: product.quantityValue,
      quantityUnit: product.quantityUnit,
      stock: product.stock,
      images: product.images,
      status: product.status
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /seller/products/:id/stock
 */
export async function updateStock(req, res, next) {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.sellerProfile._id },
      { $set: { stock: Math.max(0, parseInt(stock, 10)) } },
      { new: true }
    );

    if (!product) {
      throw new HttpError(404, CODES.PRODUCT_NOT_FOUND, null, 'Product not found');
    }

    res.json({ id: product._id.toString(), stock: product.stock });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /seller/products/:id/status
 */
export async function updateProductStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'PAUSED'].includes(status)) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Status must be ACTIVE or PAUSED');
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.sellerProfile._id },
      { $set: { status } },
      { new: true }
    );

    if (!product) {
      throw new HttpError(404, CODES.PRODUCT_NOT_FOUND, null, 'Product not found');
    }

    res.json({ id: product._id.toString(), status: product.status });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /seller/products/:id (Archive)
 */
export async function archiveProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.sellerProfile._id },
      { $set: { status: 'ARCHIVED' } },
      { new: true }
    );

    if (!product) {
      throw new HttpError(404, CODES.PRODUCT_NOT_FOUND, null, 'Product not found');
    }

    res.json({ success: true, id: product._id.toString(), status: 'ARCHIVED' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /seller/orders
 */
export async function getSellerOrders(req, res, next) {
  try {
    const sellerId = req.sellerProfile._id;
    const lang = req.lang || 'en';
    const { group = 'new' } = req.query;
    const { page, pageSize, skip, limit } = parsePagination(req.query);

    const filter = { seller: sellerId };

    if (group === 'new') {
      filter.status = 'PLACED';
    } else if (group === 'active') {
      filter.status = { $in: ['ACCEPTED', 'PACKED', 'ASSIGNED', 'PICKED_UP'] };
    } else if (group === 'completed') {
      filter.status = 'DELIVERED';
    } else if (group === 'closed') {
      filter.status = { $in: ['REJECTED', 'CANCELLED', 'DELIVERY_FAILED'] };
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('partner', 'name')
        .populate('customer', 'name')
        .lean()
    ]);

    const items = orders.map((o) => {
      const ageMinutes = Math.round((Date.now() - new Date(o.createdAt).getTime()) / (60 * 1000));
      const line = o.address?.line || '';
      const locality = line.split(',').slice(0, 2).join(',').trim();

      return {
        id: o._id.toString(),
        orderNo: o.orderNo,
        status: o.status,
        createdAt: o.createdAt,
        customerName: o.customer ? pick(o.customer.name, lang) : 'Customer',
        locality,
        itemCount: o.items?.length || 0,
        items: (o.items || []).map((it) => ({
          name: it.name ? pick(it.name, lang) : '',
          qty: it.qty
        })),
        itemsTotalPaise: o.itemsTotalPaise,
        deliveryMode: o.deliveryMode,
        sellerNetPaise: o.sellerNetPaise,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.payment?.status,
        partnerName: o.partner ? pick(o.partner.name, lang) : null,
        ageMinutes
      };
    });

    res.json({
      items,
      meta: buildPaginationMeta(total, page, pageSize)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /seller/orders/:id
 */
export async function getSellerOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const sellerId = req.sellerProfile._id;
    const lang = req.lang || 'en';

    const order = await Order.findOne({ _id: id, seller: sellerId })
      .populate('partner', 'name phone vehicleType')
      .populate('customer', 'name phone')
      .lean();

    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    const showPhone = !['AWAITING_PAYMENT', 'PLACED'].includes(order.status);

    res.json({
      id: order._id.toString(),
      orderNo: order.orderNo,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: {
        name: order.customer ? pick(order.customer.name, lang) : 'Customer',
        phone: showPhone ? (order.customer?.phone || order.address?.phone) : undefined
      },
      locality: (order.address?.line || '').split(',').slice(0, 2).join(',').trim(),
      items: (order.items || []).map((it) => ({
        productId: it.product.toString(),
        name: pick(it.name, lang),
        image: it.image,
        unitPricePaise: it.unitPricePaise,
        qty: it.qty,
        quantityValue: it.quantityValue,
        quantityUnit: it.quantityUnit,
        lineTotalPaise: it.unitPricePaise * it.qty
      })),
      itemsTotalPaise: order.itemsTotalPaise,
      deliveryMode: order.deliveryMode,
      sellerNetPaise: order.sellerNetPaise,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.payment?.status,
      partner: order.partner
        ? {
            name: pick(order.partner.name, lang),
            phone: order.partner.phone
          }
        : null,
      statusHistory: order.statusHistory || []
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /seller/orders/:id/accept
 */
export async function acceptOrder(req, res, next) {
  try {
    const { id } = req.params;
    const sellerId = req.sellerProfile._id;

    const order = await Order.findOne({ _id: id, seller: sellerId });
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    const updated = await transition(order._id, 'PLACED', 'ACCEPTED', {
      byUser: req.user._id,
      byRole: 'seller',
      note: 'Order accepted by seller'
    });

    res.json({
      id: updated._id.toString(),
      status: updated.status,
      order: { id: updated._id.toString(), status: updated.status }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /seller/orders/:id/reject
 */
export async function rejectOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const sellerId = req.sellerProfile._id;

    const order = await Order.findOne({ _id: id, seller: sellerId });
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    if (order.status !== 'PLACED' && order.status !== 'ACCEPTED') {
      throw new HttpError(400, CODES.ORDER_INVALID_TRANSITION, null, 'Order cannot be rejected at this stage');
    }

    const updated = await transition(order._id, order.status, 'REJECTED', {
      byUser: req.user._id,
      byRole: 'seller',
      reason: reason || 'Rejected by seller'
    });

    res.json({
      id: updated._id.toString(),
      status: updated.status,
      order: { id: updated._id.toString(), status: updated.status }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /seller/orders/:id/pack
 */
export async function packOrder(req, res, next) {
  try {
    const { id } = req.params;
    const sellerId = req.sellerProfile._id;

    const order = await Order.findOne({ _id: id, seller: sellerId });
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    const updated = await transition(order._id, 'ACCEPTED', 'PACKED', {
      byUser: req.user._id,
      byRole: 'seller',
      note: 'Order packed and ready for delivery partner'
    });

    res.json({
      id: updated._id.toString(),
      status: updated.status,
      order: { id: updated._id.toString(), status: updated.status }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /seller/earnings
 */
export async function getEarnings(req, res, next) {
  try {
    const { range = '7d' } = req.query;
    const earnings = await getSellerEarnings({
      sellerUser: req.user,
      range,
      query: req.query
    });
    res.json(earnings);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /seller/reviews
 */
export async function getSellerReviews(req, res, next) {
  try {
    const sellerId = req.sellerProfile._id;
    const lang = req.lang || 'en';
    const { productId, maxRating } = req.query;
    const { page, pageSize, skip, limit } = parsePagination(req.query);

    const filter = { seller: sellerId };
    if (productId) filter.product = productId;
    if (maxRating) filter.rating = { $lte: Number(maxRating) };

    const [total, reviews] = await Promise.all([
      Review.countDocuments(filter),
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('product', 'name')
        .populate('customer', 'name')
        .lean()
    ]);

    const items = reviews.map((r) => ({
      id: r._id.toString(),
      productName: r.product ? pick(r.product.name, lang) : '',
      rating: r.rating,
      text: pick(r.text, lang),
      themes: r.themes || [],
      sentiment: r.sentiment,
      createdAt: r.createdAt
    }));

    res.json({
      items,
      meta: buildPaginationMeta(total, page, pageSize)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /seller/support/tickets
 */
export async function getSellerTickets(req, res, next) {
  try {
    const sellerId = req.sellerProfile._id;
    const { status } = req.query;
    const { page, pageSize, skip, limit } = parsePagination(req.query);

    const filter = { seller: sellerId };
    if (status) filter.status = status;

    const [total, tickets] = await Promise.all([
      SupportTicket.countDocuments(filter),
      SupportTicket.find(filter)
        .sort({ unreadForSeller: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name')
        .lean()
    ]);

    const items = tickets.map((t) => ({
      id: t._id.toString(),
      ticketNo: t.ticketNo,
      subject: t.subject,
      status: t.status,
      unread: t.unreadForSeller,
      customerName: t.customer ? pick(t.customer.name, req.lang) : 'Customer',
      lastMessage: t.messages?.[t.messages.length - 1]?.text ? pick(t.messages[t.messages.length - 1].text, req.lang) : '',
      updatedAt: t.updatedAt
    }));

    res.json({
      items,
      meta: buildPaginationMeta(total, page, pageSize)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /seller/support/tickets/:id
 */
export async function getSellerTicketById(req, res, next) {
  try {
    const { id } = req.params;
    const sellerId = req.sellerProfile._id;
    const lang = req.lang || 'en';

    const ticket = await SupportTicket.findOne({ _id: id, seller: sellerId })
      .populate('order', 'orderNo status items totalPayablePaise createdAt')
      .populate('customer', 'name')
      .lean();

    if (!ticket) {
      throw new HttpError(404, CODES.TICKET_NOT_FOUND, null, 'Ticket not found');
    }

    // Mark read for seller
    await SupportTicket.findByIdAndUpdate(id, { unreadForSeller: false });

    res.json({
      id: ticket._id.toString(),
      ticketNo: ticket.ticketNo,
      subject: ticket.subject,
      status: ticket.status,
      customerName: ticket.customer ? pick(ticket.customer.name, lang) : 'Customer',
      order: ticket.order
        ? {
            id: ticket.order._id.toString(),
            orderNo: ticket.order.orderNo,
            status: ticket.order.status,
            totalPayablePaise: ticket.order.totalPayablePaise,
            createdAt: ticket.order.createdAt
          }
        : null,
      messages: (ticket.messages || []).map((m) => ({
        id: m._id ? m._id.toString() : '',
        sender: m.sender,
        text: pick(m.text, lang),
        at: m.at
      }))
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /seller/support/tickets/:id/messages
 */
export async function replyTicket(req, res, next) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const sellerId = req.sellerProfile._id;

    const ticket = await SupportTicket.findOne({ _id: id, seller: sellerId });
    if (!ticket) {
      throw new HttpError(404, CODES.TICKET_NOT_FOUND, null, 'Ticket not found');
    }

    if (ticket.status === 'RESOLVED') {
      throw new HttpError(400, CODES.TICKET_CLOSED, null, 'Ticket is resolved and closed');
    }

    const bilingualText = await ensureBilingual(toBilingualInput(text), 'translate');

    ticket.messages.push({
      sender: 'seller',
      text: bilingualText,
      originalLang: req.lang || 'en',
      at: new Date()
    });

    if (ticket.status === 'OPEN') {
      ticket.status = 'IN_PROGRESS';
    }
    ticket.unreadForCustomer = true;
    ticket.unreadForSeller = false;

    await ticket.save();

    res.json({ success: true, messageCount: ticket.messages.length });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /seller/support/tickets/:id/status
 */
export async function updateTicketStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.sellerProfile._id;

    if (!['IN_PROGRESS', 'RESOLVED'].includes(status)) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Invalid status');
    }

    const ticket = await SupportTicket.findOneAndUpdate(
      { _id: id, seller: sellerId },
      { $set: { status } },
      { new: true }
    );

    if (!ticket) {
      throw new HttpError(404, CODES.TICKET_NOT_FOUND, null, 'Ticket not found');
    }

    res.json({ id: ticket._id.toString(), status: ticket.status });
  } catch (err) {
    next(err);
  }
}

