// server/src/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerProfile',
      required: true
    },
    category: {
      type: String,
      required: true
    },
    name: {
      en: { type: String, required: true, minlength: 3, maxlength: 80 },
      mr: { type: String, required: true, minlength: 3, maxlength: 80 }
    },
    description: {
      en: { type: String, required: true, minlength: 20, maxlength: 800 },
      mr: { type: String, required: true, minlength: 20, maxlength: 800 }
    },
    pricePaise: {
      type: Number,
      required: true,
      min: 1000, // min Rs 10
      validate: {
        validator: Number.isInteger,
        message: 'pricePaise must be an integer'
      }
    },
    quantityValue: {
      type: Number,
      required: true,
      min: 0.001
    },
    quantityUnit: {
      type: String,
      required: true,
      enum: ['g', 'kg', 'ml', 'l', 'piece', 'dozen', 'metre', 'set']
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'stock must be an integer >= 0'
      }
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 5,
        message: 'Must have between 1 and 5 images'
      }
    },
    searchKeywords: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'ARCHIVED'],
      default: 'ACTIVE'
    },
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    translationStatus: {
      type: String,
      enum: ['OK', 'PENDING'],
      default: 'OK'
    },
    isDemo: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Indexes per spec
productSchema.index(
  {
    'name.en': 'text',
    'name.mr': 'text',
    'description.en': 'text',
    'description.mr': 'text',
    searchKeywords: 'text'
  },
  {
    weights: {
      'name.en': 5,
      'name.mr': 5,
      searchKeywords: 3,
      'description.en': 1,
      'description.mr': 1
    },
    name: 'ProductTextIndex'
  }
);

productSchema.index({ category: 1, status: 1, ratingAvg: -1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ status: 1, soldCount: -1 });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
