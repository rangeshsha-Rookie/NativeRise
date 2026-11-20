// server/src/models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    text: {
      en: { type: String, default: '', maxlength: 600 },
      mr: { type: String, default: '', maxlength: 600 }
    },
    originalLang: { type: String, enum: ['en', 'mr'], default: 'en' },
    themes: {
      type: [String],
      enum: ['taste', 'quality', 'freshness', 'packaging', 'delivery', 'price', 'quantity', 'service'],
      default: []
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'positive'
    },
    isDemo: { type: Boolean, default: false }
  },
  { timestamps: true }
);

reviewSchema.index({ order: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ seller: 1, createdAt: -1 });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export default Review;
