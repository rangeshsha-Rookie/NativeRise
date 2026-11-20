// server/src/models/LedgerEntry.js
import mongoose from 'mongoose';

const ledgerEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['seller', 'partner'], required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    type: {
      type: String,
      enum: ['SELLER_EARNING', 'PARTNER_EARNING', 'COD_CASH_COLLECTED', 'COD_CASH_DEPOSITED'],
      required: true
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger
    },
    breakdown: {
      itemsTotalPaise: { type: Number, validate: (v) => v === undefined || Number.isInteger(v) },
      platformFeePaise: { type: Number, validate: (v) => v === undefined || Number.isInteger(v) },
      deliveryCostPaise: { type: Number, validate: (v) => v === undefined || Number.isInteger(v) },
      netPaise: { type: Number, validate: (v) => v === undefined || Number.isInteger(v) }
    },
    note: { type: String, default: '' },
    isDemo: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Unique partial index for orders: order + type + user
ledgerEntrySchema.index(
  { order: 1, type: 1, user: 1 },
  { unique: true, partialFilterExpression: { order: { $type: 'objectId' } } }
);

export const LedgerEntry = mongoose.models.LedgerEntry || mongoose.model('LedgerEntry', ledgerEntrySchema);
export default LedgerEntry;
