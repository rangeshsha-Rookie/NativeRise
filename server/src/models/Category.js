// server/src/models/Category.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: {
      en: { type: String, required: true },
      mr: { type: String, required: true }
    },
    icon: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isDemo: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
