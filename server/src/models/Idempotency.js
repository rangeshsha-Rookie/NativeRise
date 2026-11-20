// server/src/models/Idempotency.js
import mongoose from 'mongoose';

const idempotencySchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    responseBody: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

idempotencySchema.index({ key: 1, user: 1 }, { unique: true });
// 24 hours TTL
idempotencySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const Idempotency = mongoose.models.Idempotency || mongoose.model('Idempotency', idempotencySchema);
export default Idempotency;
