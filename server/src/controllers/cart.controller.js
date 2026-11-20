// server/src/controllers/cart.controller.js
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import SellerProfile from '../models/SellerProfile.js';
import { pick } from '../utils/pick.js';
import { MAX_CART_QTY_PER_ITEM } from '../config/constants.js';
import { checkFeasibility } from '../services/geo.service.js';
import {
  calculatePartnerPayout,
  calculateMinItemsTotalForIncluded
} from '../services/pricing.service.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], seller: null });
  }
  return cart;
}

function formatCart(cart, lang) {
  const seller = cart.seller;
  let itemsTotalPaise = 0;

  const lines = (cart.items || []).map((item) => {
    const p = item.product;
    if (!p || typeof p !== 'object') {
      return {
        productId: item.product?.toString(),
        name: '',
        image: '',
        unitPricePaise: 0,
        qty: item.qty,
        stock: 0,
        available: 0,
        quantityValue: 0,
        quantityUnit: '',
        lineTotalPaise: 0,
        issue: 'UNAVAILABLE'
      };
    }

    const isAvailable = p.status === 'ACTIVE';
    const isOutOfStock = p.stock <= 0;
    const isExceeded = item.qty > p.stock;

    let issue = null;
    if (!isAvailable) issue = 'UNAVAILABLE';
    else if (isOutOfStock) issue = 'OUT_OF_STOCK';
    else if (isExceeded) issue = 'QTY_EXCEEDS_STOCK';

    const unitPricePaise = p.pricePaise || 0;
    const lineTotalPaise = unitPricePaise * item.qty;
    if (isAvailable && !isOutOfStock) {
      itemsTotalPaise += lineTotalPaise;
    }

    return {
      productId: p._id.toString(),
      name: pick(p.name, lang),
      image: p.images?.[0] || '',
      unitPricePaise,
      qty: item.qty,
      stock: p.stock || 0,
      available: Math.max(0, p.stock || 0),
      quantityValue: p.quantityValue,
      quantityUnit: p.quantityUnit,
      lineTotalPaise,
      issue
    };
  });

  return {
    seller: seller
      ? {
          id: seller._id ? seller._id.toString() : seller.toString(),
          shopName: seller.shopName ? pick(seller.shopName, lang) : '',
          village: seller.village ? pick(seller.village, lang) : '',
          minOrderPaise: seller.minOrderPaise || 0,
          deliveryMode: seller.deliveryMode || 'INCLUDED'
        }
      : null,
    lines,
    itemsTotalPaise,
    count: lines.length
  };
}

/**
 * GET /cart
 */
export async function getCart(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const cart = await getOrCreateCart(req.user._id);
    await cart.populate([
      { path: 'items.product' },
      { path: 'seller' }
    ]);

    res.json(formatCart(cart, lang));
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /cart/items
 */
export async function updateCartItem(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const { productId, qty, replace } = req.body;

    const cart = await getOrCreateCart(req.user._id);
    await cart.populate([{ path: 'seller' }]);

    // If qty === 0, remove item
    if (qty === 0) {
      cart.items = cart.items.filter((item) => item.product.toString() !== productId);
      if (cart.items.length === 0) {
        cart.seller = null;
      }
      await cart.save();
      await cart.populate([{ path: 'items.product' }, { path: 'seller' }]);
      return res.json(formatCart(cart, lang));
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== 'ACTIVE') {
      throw new HttpError(404, CODES.PRODUCT_UNAVAILABLE, null, 'Product unavailable');
    }

    if (qty > product.stock) {
      throw new HttpError(400, CODES.INSUFFICIENT_STOCK, { available: product.stock }, 'Insufficient stock');
    }

    if (qty > MAX_CART_QTY_PER_ITEM) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, { qty: `Max ${MAX_CART_QTY_PER_ITEM} per item` }, 'Quantity limit exceeded');
    }

    // Check seller conflict
    const productSellerId = product.seller.toString();
    const currentSellerId = cart.seller ? (cart.seller._id ? cart.seller._id.toString() : cart.seller.toString()) : null;

    if (currentSellerId && currentSellerId !== productSellerId && cart.items.length > 0) {
      if (!replace) {
        const [currentSellerDoc, newSellerDoc] = await Promise.all([
          SellerProfile.findById(currentSellerId),
          SellerProfile.findById(productSellerId)
        ]);

        throw new HttpError(
          409,
          CODES.CART_DIFFERENT_SELLER,
          {
            currentSeller: {
              id: currentSellerId,
              shopName: currentSellerDoc ? pick(currentSellerDoc.shopName, lang) : ''
            },
            newSeller: {
              id: productSellerId,
              shopName: newSellerDoc ? pick(newSellerDoc.shopName, lang) : ''
            }
          },
          'Cart has items from another seller'
        );
      } else {
        // Replace: clear existing
        cart.items = [];
        cart.seller = product.seller;
      }
    } else {
      cart.seller = product.seller;
    }

    // Update or add item
    const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (existingIndex > -1) {
      cart.items[existingIndex].qty = qty;
    } else {
      cart.items.push({ product: product._id, qty });
    }

    await cart.save();
    await cart.populate([{ path: 'items.product' }, { path: 'seller' }]);

    res.json(formatCart(cart, lang));
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /cart/items/:productId
 */
export async function removeCartItem(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const { productId } = req.params;

    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);

    if (cart.items.length === 0) {
      cart.seller = null;
    }

    await cart.save();
    await cart.populate([{ path: 'items.product' }, { path: 'seller' }]);

    res.json(formatCart(cart, lang));
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /cart
 */
export async function clearCart(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [], seller: null } },
      { new: true, upsert: true }
    );

    res.json(formatCart(cart, lang));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /cart/quote?addressId=
 */
export async function getCartQuote(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const { addressId } = req.query;

    const cart = await getOrCreateCart(req.user._id);
    await cart.populate([
      { path: 'items.product' },
      { path: 'seller' }
    ]);

    const formattedCart = formatCart(cart, lang);
    const seller = cart.seller;
    const issues = [];

    if (!seller || cart.items.length === 0) {
      return res.json({
        lines: [],
        itemsTotalPaise: 0,
        seller: null,
        feasibility: null,
        deliveryChargePaise: 0,
        totalPayableOnlinePaise: 0,
        etaMins: 0,
        issues: [{ code: 'EMPTY_CART' }],
        canCheckout: false
      });
    }

    // Check item issues (stock, availability)
    formattedCart.lines.forEach((line) => {
      if (line.issue === 'UNAVAILABLE') {
        issues.push({ code: 'PRODUCT_UNAVAILABLE', productId: line.productId });
      } else if (line.issue === 'OUT_OF_STOCK' || line.issue === 'QTY_EXCEEDS_STOCK') {
        issues.push({
          code: 'INSUFFICIENT_STOCK',
          productId: line.productId,
          details: { available: line.available }
        });
      }
    });

    // Check seller accepting orders
    if (!seller.isAcceptingOrders) {
      issues.push({ code: 'SELLER_NOT_ACCEPTING' });
    }

    // Check address & feasibility
    let feasibilityResult = null;
    let customerDeliveryCharge = 0;
    let etaMins = 0;

    if (!addressId) {
      issues.push({ code: 'ADDRESS_REQUIRED' });
    } else {
      const address = req.user.addresses.id(addressId);
      if (!address) {
        issues.push({ code: 'ADDRESS_REQUIRED' });
      } else {
        feasibilityResult = await checkFeasibility(seller, address);
        etaMins = feasibilityResult.etaMins;

        if (!feasibilityResult.feasible) {
          if (feasibilityResult.reason === 'SELLER_NOT_ACCEPTING') {
            if (!issues.some((i) => i.code === 'SELLER_NOT_ACCEPTING')) {
              issues.push({ code: 'SELLER_NOT_ACCEPTING' });
            }
          } else {
            issues.push({ code: 'OUT_OF_DELIVERY_RANGE' });
          }
        } else {
          customerDeliveryCharge = feasibilityResult.deliveryChargePaise;
        }
      }
    }

    // Check minimum order paise
    const itemsTotal = formattedCart.itemsTotalPaise;
    if (itemsTotal < (seller.minOrderPaise || 0)) {
      issues.push({
        code: 'MIN_ORDER_NOT_MET',
        details: { neededPaise: seller.minOrderPaise - itemsTotal }
      });
    }

    // Check seller net >= 0 when INCLUDED
    if (seller.deliveryMode === 'INCLUDED' && feasibilityResult && feasibilityResult.feasible) {
      const partnerPayout = calculatePartnerPayout(feasibilityResult.distanceKm);
      const minNeededForNet = calculateMinItemsTotalForIncluded(partnerPayout);
      if (itemsTotal < minNeededForNet) {
        const needed = minNeededForNet - itemsTotal;
        if (!issues.some((i) => i.code === 'MIN_ORDER_NOT_MET')) {
          issues.push({
            code: 'MIN_ORDER_NOT_MET',
            details: { neededPaise: needed }
          });
        }
      }
    }

    const totalPayableOnlinePaise = itemsTotal + customerDeliveryCharge;
    const canCheckout = issues.length === 0;

    res.json({
      lines: formattedCart.lines,
      itemsTotalPaise: itemsTotal,
      seller: formattedCart.seller,
      feasibility: feasibilityResult
        ? {
            feasible: feasibilityResult.feasible,
            distanceKm: feasibilityResult.distanceKm,
            estimated: feasibilityResult.estimated,
            etaMins: feasibilityResult.etaMins,
            deliveryMode: feasibilityResult.deliveryMode,
            deliveryChargePaise: feasibilityResult.deliveryChargePaise,
            reason: feasibilityResult.reason
          }
        : null,
      deliveryChargePaise: customerDeliveryCharge,
      totalPayableOnlinePaise,
      etaMins,
      issues,
      canCheckout
    });
  } catch (err) {
    next(err);
  }
}
