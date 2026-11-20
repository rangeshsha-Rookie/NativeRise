// server/src/models/SearchMiss.js
import mongoose from 'mongoose';

const searchMissSchema = new mongoose.Schema(
  {
    queryNormalized: { type: String, required: true, unique: true, lowercase: true, trim: true },
    lang: { type: String, enum: ['en', 'mr'], default: 'en' },
    count: { type: Number, default: 1 },
    lastAt: { type: Date, default: Date.now },
    isDemo: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const SearchMiss = mongoose.models.SearchMiss || mongoose.model('SearchMiss', searchMissSchema);
export default SearchMiss;
