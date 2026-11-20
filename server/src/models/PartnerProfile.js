// server/src/models/PartnerProfile.js
import mongoose from 'mongoose';
import { PARTNER_DEFAULT_RADIUS_KM } from '../config/constants.js';

const partnerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    vehicleType: {
      type: String,
      enum: ['BIKE', 'CYCLE', 'ON_FOOT', 'AUTO'],
      required: true
    },
    vehicleNumber: {
      type: String,
      uppercase: true,
      trim: true
    },
    baseLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      line: { type: String, required: true }
    },
    serviceRadiusKm: {
      type: Number,
      default: PARTNER_DEFAULT_RADIUS_KM,
      min: 3,
      max: 60
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastLocation: {
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number },
      at: { type: Date }
    },
    activeOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    isDemo: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

partnerProfileSchema.index({ isOnline: 1 });

export const PartnerProfile = mongoose.models.PartnerProfile || mongoose.model('PartnerProfile', partnerProfileSchema);
export default PartnerProfile;
