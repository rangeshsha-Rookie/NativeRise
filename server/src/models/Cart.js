// server/src/models/Cart.js
import mongoose from 'mongoose';
import { MAX_CART_QTY_PER_ITEM } from '../config/constants.js';

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
      max: MAX_CART_QTY_PER_ITEM,
      validate: {
        validator: Number.isInteger,
        message: 'Cart item qty must be an integer'
      }
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
      default: null
    },
    items: {
      type: [cartItemSchema],
      default: []
    }
  },
  { timestamps: true }
);

export const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export default Cart;
