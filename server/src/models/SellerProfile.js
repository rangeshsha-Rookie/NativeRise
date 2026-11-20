// server/src/models/SellerProfile.js
import mongoose from 'mongoose';
import {
  DEFAULT_MAX_DELIVERY_KM,
  DEFAULT_PREP_MINS,
  DEFAULT_MIN_ORDER_PAISE
} from '../config/constants.js';

const sellerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    shopName: {
      en: { type: String, required: true },
      mr: { type: String, required: true }
    },
    story: {
      en: { type: String, required: true, minlength: 40, maxlength: 600 },
      mr: { type: String, required: true, minlength: 40, maxlength: 600 }
    },
    village: {
      en: { type: String, required: true },
      mr: { type: String, required: true }
    },
    district: { type: String, required: true },
    state: { type: String, default: 'Maharashtra' },
    pincode: { type: String, required: true, match: [/^\d{6}$/, 'Must be 6 digits'] },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      line: { type: String, required: true }
    },
    maxDeliveryKm: {
      type: Number,
      default: DEFAULT_MAX_DELIVERY_KM,
      min: 3,
      max: 100
    },
    prepTimeMins: {
      type: Number,
      default: DEFAULT_PREP_MINS,
      min: 15,
      max: 1440
    },
    minOrderPaise: {
      type: Number,
      default: DEFAULT_MIN_ORDER_PAISE,
      validate: {
        validator: Number.isInteger,
        message: 'minOrderPaise must be integer paise'
      }
    },
    deliveryMode: {
      type: String,
      enum: ['INCLUDED', 'CUSTOMER_PAYS'],
      default: 'INCLUDED'
    },
    isAcceptingOrders: {
      type: Boolean,
      default: true
    },
    photoUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    isDemo: { type: Boolean, default: false }
  },
  { timestamps: true }
);

sellerProfileSchema.index({ district: 1 });
sellerProfileSchema.index({ state: 1 });

export const SellerProfile = mongoose.models.SellerProfile || mongoose.model('SellerProfile', sellerProfileSchema);
export default SellerProfile;
