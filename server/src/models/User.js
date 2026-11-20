// server/src/models/User.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    line: { type: String, required: true },
    landmark: { type: String, default: '' },
    lat: { type: Number, required: true, min: 6, max: 38 },
    lng: { type: Number, required: true, min: 68, max: 98 },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['customer', 'seller', 'partner'],
      immutable: true
    },
    name: {
      en: { type: String, required: true },
      mr: { type: String, required: true }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian 10-digit phone number']
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    preferredLang: {
      type: String,
      enum: ['en', 'mr'],
      default: 'en'
    },
    addresses: {
      type: [addressSchema],
      default: []
    },
    isDemo: {
      type: Boolean,
      default: false
    },
    lastLoginAt: {
      type: Date
    }
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.methods.comparePassword = async function (candidatePassword) {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
