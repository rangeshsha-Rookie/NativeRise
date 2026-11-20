// server/src/models/Order.js
import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      en: { type: String, required: true },
      mr: { type: String, required: true }
    },
    image: { type: String, required: true },
    unitPricePaise: { type: Number, required: true, validate: Number.isInteger },
    qty: { type: Number, required: true, min: 1, validate: Number.isInteger },
    quantityValue: { type: Number, required: true },
    quantityUnit: { type: String, required: true }
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    byRole: { type: String },
    note: { type: String }
  },
  { _id: false }
);

const trailPointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    at: { type: Date, default: Date.now },
    simulated: { type: Boolean, default: false }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true },
    items: { type: [orderItemSnapshotSchema], required: true },
    itemsTotalPaise: { type: Number, required: true, validate: Number.isInteger },
    deliveryMode: { type: String, enum: ['INCLUDED', 'CUSTOMER_PAYS'], required: true },
    customerDeliveryChargePaise: { type: Number, required: true, default: 0, validate: Number.isInteger },
    totalPayablePaise: { type: Number, required: true, validate: Number.isInteger },
    partnerPayoutPaise: { type: Number, required: true, validate: Number.isInteger },
    platformFeePaise: { type: Number, required: true, validate: Number.isInteger },
    sellerNetPaise: { type: Number, required: true, validate: Number.isInteger },
    address: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      line: { type: String, required: true },
      landmark: { type: String, default: '' },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    pickup: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      line: { type: String, required: true }
    },
    roadDistanceKm: { type: Number, required: true },
    distanceEstimated: { type: Boolean, default: false },
    etaMins: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['RAZORPAY', 'COD'], required: true },
    payment: {
      status: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'COD_PENDING', 'COD_COLLECTED'],
        default: 'PENDING'
      },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      paymentInstrument: { type: String },
      paidAt: { type: Date },
      refundId: { type: String },
      refundedAt: { type: Date },
      refundReason: { type: String }
    },
    status: {
      type: String,
      enum: [
        'AWAITING_PAYMENT',
        'PLACED',
        'ACCEPTED',
        'REJECTED',
        'PACKED',
        'ASSIGNED',
        'PICKED_UP',
        'DELIVERED',
        'DELIVERY_FAILED',
        'CANCELLED'
      ],
      default: 'AWAITING_PAYMENT'
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    partnerAssignedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    deliveryCode: { type: String, select: false },
    codeAttempts: { type: Number, default: 0 },
    codeLockedUntil: { type: Date, default: null },
    liveLocation: {
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number },
      at: { type: Date },
      simulated: { type: Boolean, default: false }
    },
    trail: { type: [trailPointSchema], default: [] },
    milestones: {
      nearingAt: { type: Date },
      arrivedAt: { type: Date }
    },
    deliveredFarFromDrop: { type: Boolean, default: false },
    failure: {
      reason: {
        type: String,
        enum: ['CUSTOMER_UNREACHABLE', 'ADDRESS_NOT_FOUND', 'CUSTOMER_REFUSED', 'OTHER']
      },
      note: { type: String },
      at: { type: Date }
    },
    cancellation: {
      by: { type: String, enum: ['customer', 'system', 'seller', 'partner'] },
      reason: { type: String },
      at: { type: Date }
    },
    ledgerPosted: { type: Boolean, default: false },
    stockRestored: { type: Boolean, default: false },
    idempotencyKey: { type: String },
    isDemo: { type: Boolean, default: false }
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, status: 1, createdAt: -1 });
orderSchema.index({ status: 1, partner: 1 });
orderSchema.index({ status: 1, 'pickup.lat': 1 });
orderSchema.index({ 'payment.razorpayOrderId': 1 });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
