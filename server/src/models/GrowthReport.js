// server/src/models/GrowthReport.js
import mongoose from 'mongoose';

const growthReportSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true },
    lang: { type: String, enum: ['en', 'mr'], required: true },
    fingerprint: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    stats: { type: mongoose.Schema.Types.Mixed, required: true },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

growthReportSchema.index({ seller: 1, lang: 1 }, { unique: true });

export const GrowthReport = mongoose.models.GrowthReport || mongoose.model('GrowthReport', growthReportSchema);
export default GrowthReport;
