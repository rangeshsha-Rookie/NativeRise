// server/src/controllers/catalog.controller.js
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import SellerProfile from '../models/SellerProfile.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import SearchMiss from '../models/SearchMiss.js';
import { pick } from '../utils/pick.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { haversineKm, checkFeasibility } from '../services/geo.service.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function maskReviewerName(nameStr) {
  if (!nameStr) return 'Customer';
  const parts = nameStr.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0);
  return `${first} ${lastInitial}.`;
}

function formatProductItem(p, lang, categoryMap = {}, deliveryMap = {}) {
  const cat = categoryMap[p.category] || { slug: p.category, name: { en: p.category, mr: p.category } };
  const seller = p.seller;
  const sellerId = seller?._id?.toString() || seller?.toString();

  const formatted = {
    id: p._id.toString(),
    name: pick(p.name, lang),
    description: pick(p.description, lang),
    pricePaise: p.pricePaise,
    quantityValue: p.quantityValue,
    quantityUnit: p.quantityUnit,
    stock: p.stock,
    images: p.images || [],
    category: {
      slug: cat.slug || p.category,
      name: pick(cat.name, lang)
    },
    ratingAvg: p.ratingAvg || 0,
    ratingCount: p.ratingCount || 0,
    seller: {
      id: sellerId,
      shopName: seller?.shopName ? pick(seller.shopName, lang) : '',
      village: seller?.village ? pick(seller.village, lang) : '',
      ratingAvg: seller?.ratingAvg || 0
    }
  };

  if (deliveryMap[sellerId]) {
    const d = deliveryMap[sellerId];
    formatted.delivery = {
      feasible: d.feasible,
      deliveryChargePaise: d.deliveryChargePaise,
      etaMins: d.etaMins,
      distanceKm: d.distanceKm
    };
  }

  return formatted;
}

/**
 * GET /categories
 */
export async function getCategories(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const categories = await Category.find().sort({ sortOrder: 1 }).lean();

    const result = categories.map((c) => ({
      slug: c.slug,
      name: pick(c.name, lang),
      icon: c.icon,
      sortOrder: c.sortOrder
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /search/suggest?q=
 */
export async function getSearchSuggestions(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const lang = req.lang || 'en';

    if (!q || q.length < 2) {
      return res.json({ products: [], categories: [] });
    }

    const escaped = escapeRegex(q);
    const regex = new RegExp(`^${escaped}`, 'i');
    const anywhereRegex = new RegExp(escaped, 'i');

    const [products, categories] = await Promise.all([
      Product.find({
        status: 'ACTIVE',
        $or: [
          { 'name.en': anywhereRegex },
          { 'name.mr': anywhereRegex },
          { searchKeywords: anywhereRegex }
        ]
      })
        .limit(6)
        .lean(),
      Category.find({
        $or: [{ 'name.en': regex }, { 'name.mr': regex }, { slug: regex }]
      })
        .limit(3)
        .lean()
    ]);

    res.json({
      products: products.map((p) => ({
        id: p._id.toString(),
        name: pick(p.name, lang)
      })),
      categories: categories.map((c) => ({
        slug: c.slug,
        name: pick(c.name, lang)
      }))
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Helper to compute delivery for distinct sellers when coords provided
 */
async function computeSellerDeliveries(sellerDocs, customerCoords) {
  const deliveryMap = {};
  if (!customerCoords || customerCoords.lat === undefined || customerCoords.lng === undefined) {
    return deliveryMap;
  }

  for (const seller of sellerDocs) {
    if (!seller) continue;
    const sId = seller._id.toString();
    if (!deliveryMap[sId]) {
      try {
        const feas = await checkFeasibility(seller, customerCoords);
        deliveryMap[sId] = feas;
      } catch {
        deliveryMap[sId] = {
          feasible: false,
          deliveryChargePaise: 0,
          etaMins: 0,
          distanceKm: 0
        };
      }
    }
  }
  return deliveryMap;
}

/**
 * GET /products
 */
export async function getProducts(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const {
      q,
      category,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sellerId,
      sort = 'popular'
    } = req.query;

    const { page, pageSize, skip, limit } = parsePagination(req.query);

    const filter = { status: 'ACTIVE' };

    if (category) {
      filter.category = category;
    }

    if (sellerId) {
      filter.seller = sellerId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePaise = {};
      if (minPrice !== undefined) {
        filter.pricePaise.$gte = Math.round(Number(minPrice) * 100);
      }
      if (maxPrice !== undefined) {
        filter.pricePaise.$lte = Math.round(Number(maxPrice) * 100);
      }
    }

    if (minRating !== undefined) {
      filter.ratingAvg = { $gte: Number(minRating) };
    }

    if (inStock === 'true' || inStock === true) {
      filter.stock = { $gt: 0 };
    }

    // Text search or fallback
    let isTextSearch = false;
    if (q && q.trim()) {
      const trimmedQ = q.trim();
      const countMatching = await Product.countDocuments({
        ...filter,
        $text: { $search: trimmedQ }
      });

      if (countMatching > 0) {
        filter.$text = { $search: trimmedQ };
        isTextSearch = true;
      } else {
        // Fallback to prefix/substring regex
        const escaped = escapeRegex(trimmedQ);
        const rgx = new RegExp(escaped, 'i');
        filter.$or = [
          { 'name.en': rgx },
          { 'name.mr': rgx },
          { searchKeywords: rgx }
        ];

        const fallbackCount = await Product.countDocuments(filter);
        if (fallbackCount === 0) {
          // Log search miss in background
          SearchMiss.updateOne(
            { queryNormalized: trimmedQ.toLowerCase() },
            {
              $inc: { count: 1 },
              $set: { lastAt: new Date(), lang }
            },
            { upsert: true }
          ).catch(() => {});
        }
      }
    }

    // Sorting
    let sortQuery = {};
    if (sort === 'relevance' && isTextSearch) {
      sortQuery = { score: { $meta: 'textScore' } };
    } else if (sort === 'price_asc') {
      sortQuery = { pricePaise: 1 };
    } else if (sort === 'price_desc') {
      sortQuery = { pricePaise: -1 };
    } else if (sort === 'rating') {
      sortQuery = { ratingAvg: -1, ratingCount: -1 };
    } else if (sort === 'newest') {
      sortQuery = { createdAt: -1 };
    } else {
      // 'popular'
      sortQuery = { soldCount: -1, ratingAvg: -1 };
    }

    const [total, products, categories] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter, isTextSearch ? { score: { $meta: 'textScore' } } : {})
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate('seller')
        .lean(),
      Category.find().lean()
    ]);

    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.slug] = c;
    });

    // Compute delivery info if lat/lng provided
    let deliveryMap = {};
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      const distinctSellers = products.map((p) => p.seller).filter(Boolean);
      deliveryMap = await computeSellerDeliveries(distinctSellers, { lat, lng });
    }

    const items = products.map((p) => formatProductItem(p, lang, categoryMap, deliveryMap));

    res.json({
      items,
      meta: buildPaginationMeta(total, page, pageSize)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /products/trending (PART 1 Section 11.10)
 */
export async function getTrendingProducts(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const limit = 12;

    // Last 14 days delivered units from orders
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const deliveredRecent = await Order.aggregate([
      { $match: { status: 'DELIVERED', createdAt: { $gte: fourteenDaysAgo } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          deliveredUnits: { $sum: '$items.qty' }
        }
      },
      { $sort: { deliveredUnits: -1 } },
      { $limit: limit }
    ]);

    const deliveredIds = deliveredRecent.map((d) => d._id);

    // Fetch active products matching those IDs first, or fill with highest ratingAvg & soldCount
    const products = await Product.find({
      status: 'ACTIVE'
    })
      .sort({ ratingAvg: -1, soldCount: -1 })
      .limit(limit)
      .populate('seller')
      .lean();

    // Re-order if recent delivered units exist
    if (deliveredIds.length > 0) {
      const idMap = new Map(products.map((p) => [p._id.toString(), p]));
      const sorted = [];
      for (const d of deliveredRecent) {
        const p = idMap.get(d._id.toString());
        if (p) {
          sorted.push(p);
          idMap.delete(d._id.toString());
        }
      }
      for (const remaining of idMap.values()) {
        sorted.push(remaining);
      }
      products.splice(0, products.length, ...sorted.slice(0, limit));
    }

    const categories = await Category.find().lean();
    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.slug] = c;
    });

    const items = products.map((p) => formatProductItem(p, lang, categoryMap));
    res.json(items);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /products/:id
 */
export async function getProductById(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const { id } = req.params;

    const product = await Product.findById(id).populate('seller').lean();
    if (!product) {
      throw new HttpError(404, CODES.NOT_FOUND, null, 'Product not found');
    }

    if (product.status !== 'ACTIVE') {
      throw new HttpError(404, CODES.PRODUCT_UNAVAILABLE, null, 'Product unavailable');
    }

    const seller = product.seller;
    const categories = await Category.find().lean();
    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.slug] = c;
    });

    // Rating breakdown (1..5 stars)
    const ratingAggregate = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingAggregate.forEach((r) => {
      if (r._id >= 1 && r._id <= 5) {
        ratingBreakdown[r._id] = r.count;
      }
    });

    // More products from same seller (up to 6)
    const moreFromSellerDocs = await Product.find({
      seller: seller._id,
      status: 'ACTIVE',
      _id: { $ne: product._id }
    })
      .limit(6)
      .populate('seller')
      .lean();

    // Related products from same category (up to 6)
    const relatedDocs = await Product.find({
      category: product.category,
      status: 'ACTIVE',
      _id: { $ne: product._id }
    })
      .limit(6)
      .populate('seller')
      .lean();

    const formattedProduct = formatProductItem(product, lang, categoryMap);

    const sellerSummary = {
      id: seller._id.toString(),
      shopName: pick(seller.shopName, lang),
      village: pick(seller.village, lang),
      district: seller.district,
      photoUrl: seller.photoUrl || '',
      ratingAvg: seller.ratingAvg || 0,
      ratingCount: seller.ratingCount || 0,
      deliveryMode: seller.deliveryMode,
      maxDeliveryKm: seller.maxDeliveryKm,
      minOrderPaise: seller.minOrderPaise,
      isAcceptingOrders: seller.isAcceptingOrders
    };

    res.json({
      product: formattedProduct,
      seller: sellerSummary,
      ratingBreakdown,
      moreFromSeller: moreFromSellerDocs.map((p) => formatProductItem(p, lang, categoryMap)),
      related: relatedDocs.map((p) => formatProductItem(p, lang, categoryMap))
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /products/:id/reviews
 */
export async function getProductReviews(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const { id } = req.params;
    const { sort = 'newest' } = req.query;
    const { page, pageSize, skip, limit } = parsePagination(req.query);

    let sortQuery = { createdAt: -1 };
    if (sort === 'highest') sortQuery = { rating: -1, createdAt: -1 };
    if (sort === 'lowest') sortQuery = { rating: 1, createdAt: -1 };

    const filter = { product: id };

    const [total, reviews] = await Promise.all([
      Review.countDocuments(filter),
      Review.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name')
        .lean()
    ]);

    const items = reviews.map((r) => {
      const customerName = r.customer ? pick(r.customer.name, lang) : 'Customer';
      return {
        id: r._id.toString(),
        rating: r.rating,
        text: pick(r.text, lang),
        reviewerName: maskReviewerName(customerName),
        createdAt: r.createdAt,
        verified: true
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
 * GET /sellers
 */
export async function getSellers(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const { q, category } = req.query;
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const hasCoords = !isNaN(lat) && !isNaN(lng);

    const filter = { isAcceptingOrders: true };

    if (q && q.trim()) {
      const rgx = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [
        { 'shopName.en': rgx },
        { 'shopName.mr': rgx },
        { 'village.en': rgx },
        { 'village.mr': rgx },
        { district: rgx }
      ];
    }

    if (category) {
      // Find sellers with at least one active product in this category
      const sellersWithCat = await Product.distinct('seller', { category, status: 'ACTIVE' });
      filter._id = { $in: sellersWithCat };
    }

    const sellers = await SellerProfile.find(filter).lean();

    const formattedSellers = sellers.map((s) => {
      let distanceKm = null;
      let feasible = true;

      if (hasCoords) {
        distanceKm = haversineKm(lat, lng, s.location.lat, s.location.lng);
        feasible = distanceKm <= s.maxDeliveryKm;
      }

      return {
        id: s._id.toString(),
        shopName: pick(s.shopName, lang),
        village: pick(s.village, lang),
        district: s.district,
        state: s.state,
        photoUrl: s.photoUrl || '',
        coverUrl: s.coverUrl || '',
        ratingAvg: s.ratingAvg || 0,
        ratingCount: s.ratingCount || 0,
        deliveryMode: s.deliveryMode,
        maxDeliveryKm: s.maxDeliveryKm,
        minOrderPaise: s.minOrderPaise,
        distanceKm,
        feasible
      };
    });

    if (hasCoords) {
      formattedSellers.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    } else {
      formattedSellers.sort((a, b) => b.ratingAvg - a.ratingAvg);
    }

    res.json(formattedSellers);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /sellers/:id
 */
export async function getSellerById(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const { id } = req.params;

    const seller = await SellerProfile.findById(id).lean();
    if (!seller) {
      throw new HttpError(404, CODES.NOT_FOUND, null, 'Seller not found');
    }

    const [productCount, deliveredCount] = await Promise.all([
      Product.countDocuments({ seller: seller._id, status: 'ACTIVE' }),
      Order.countDocuments({ seller: seller._id, status: 'DELIVERED' })
    ]);

    res.json({
      id: seller._id.toString(),
      shopName: pick(seller.shopName, lang),
      story: pick(seller.story, lang),
      village: pick(seller.village, lang),
      district: seller.district,
      state: seller.state,
      photoUrl: seller.photoUrl || '',
      coverUrl: seller.coverUrl || '',
      ratingAvg: seller.ratingAvg || 0,
      ratingCount: seller.ratingCount || 0,
      productCount,
      deliveredCount,
      deliveryMode: seller.deliveryMode,
      maxDeliveryKm: seller.maxDeliveryKm,
      prepTimeMins: seller.prepTimeMins,
      minOrderPaise: seller.minOrderPaise,
      isAcceptingOrders: seller.isAcceptingOrders,
      since: seller.createdAt
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /sellers/:id/products
 */
export async function getSellerProducts(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const { id } = req.params;
    const { page, pageSize, skip, limit } = parsePagination(req.query);

    const filter = { seller: id, status: 'ACTIVE' };

    const [total, products, categories] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort({ ratingAvg: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('seller')
        .lean(),
      Category.find().lean()
    ]);

    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.slug] = c;
    });

    const items = products.map((p) => formatProductItem(p, lang, categoryMap));

    res.json({
      items,
      meta: buildPaginationMeta(total, page, pageSize)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /home
 */
export async function getHomeData(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const hasCoords = !isNaN(lat) && !isNaN(lng);

    const [
      categories,
      trendingProducts,
      newArrivalsDocs,
      topRatedDocs,
      allSellers,
      activeSellersCount,
      activeProductsCount,
      deliveredOrdersCount,
      recentReviewDocs
    ] = await Promise.all([
      Category.find().sort({ sortOrder: 1 }).lean(),
      Product.find({ status: 'ACTIVE' }).sort({ soldCount: -1, ratingAvg: -1 }).limit(8).populate('seller').lean(),
      Product.find({ status: 'ACTIVE' }).sort({ createdAt: -1 }).limit(8).populate('seller').lean(),
      Product.find({ status: 'ACTIVE', ratingCount: { $gte: 3 } }).sort({ ratingAvg: -1, ratingCount: -1 }).limit(8).populate('seller').lean(),
      SellerProfile.find({ isAcceptingOrders: true }).lean(),
      SellerProfile.countDocuments({ isAcceptingOrders: true }),
      Product.countDocuments({ status: 'ACTIVE' }),
      Order.countDocuments({ status: 'DELIVERED' }),
      Review.find().sort({ createdAt: -1 }).limit(3).populate('customer', 'name').populate('product', 'name').lean()
    ]);

    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.slug] = c;
    });

    // Nearby sellers (up to 6 if coords given)
    let nearbySellers = [];
    if (hasCoords) {
      nearbySellers = allSellers
        .map((s) => {
          const dist = haversineKm(lat, lng, s.location.lat, s.location.lng);
          return {
            id: s._id.toString(),
            shopName: pick(s.shopName, lang),
            village: pick(s.village, lang),
            photoUrl: s.photoUrl || '',
            ratingAvg: s.ratingAvg || 0,
            distanceKm: dist,
            feasible: dist <= s.maxDeliveryKm
          };
        })
        .filter((s) => s.feasible)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 6);
    }

    // 4 Seller stories (excerpt <= 140 chars)
    const sellerStories = allSellers.slice(0, 4).map((s) => {
      const fullStory = pick(s.story, lang);
      const excerpt = fullStory.length > 140 ? fullStory.slice(0, 137) + '...' : fullStory;
      return {
        id: s._id.toString(),
        shopName: pick(s.shopName, lang),
        village: pick(s.village, lang),
        story: excerpt,
        photoUrl: s.photoUrl || ''
      };
    });

    // 3 Recent verified reviews
    const recentReviews = recentReviewDocs.map((r) => {
      const reviewer = r.customer ? pick(r.customer.name, lang) : 'Customer';
      const text = pick(r.text, lang);
      const textExcerpt = text.length > 120 ? text.slice(0, 117) + '...' : text;
      return {
        id: r._id.toString(),
        reviewer: maskReviewerName(reviewer),
        rating: r.rating,
        text: textExcerpt,
        productName: r.product ? pick(r.product.name, lang) : '',
        productId: r.product?._id?.toString() || ''
      };
    });

    res.json({
      categories: categories.map((c) => ({
        slug: c.slug,
        name: pick(c.name, lang),
        icon: c.icon,
        sortOrder: c.sortOrder
      })),
      trending: trendingProducts.map((p) => formatProductItem(p, lang, categoryMap)),
      newArrivals: newArrivalsDocs.map((p) => formatProductItem(p, lang, categoryMap)),
      topRated: topRatedDocs.map((p) => formatProductItem(p, lang, categoryMap)),
      nearbySellers,
      sellerStories,
      stats: {
        sellers: activeSellersCount,
        products: activeProductsCount,
        delivered: deliveredOrdersCount
      },
      recentReviews
    });
  } catch (err) {
    next(err);
  }
}
