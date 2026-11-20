// server/src/models/TranslationCache.js
import mongoose from 'mongoose';

const translationCacheSchema = new mongoose.Schema(
  {
    hash: { type: String, required: true, unique: true },
    result: { type: String, required: true }
  },
  { timestamps: true }
);

export const TranslationCache = mongoose.models.TranslationCache || mongoose.model('TranslationCache', translationCacheSchema);
export default TranslationCache;
