// server/src/models/SupportTicket.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ['customer', 'seller'], required: true },
    text: {
      en: { type: String, required: true },
      mr: { type: String, required: true }
    },
    originalLang: { type: String, enum: ['en', 'mr'], default: 'en' },
    at: { type: Date, default: Date.now }
  },
  { _id: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNo: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerProfile', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    subject: { type: String, required: true, maxlength: 120 },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
      default: 'OPEN'
    },
    createdVia: {
      type: String,
      enum: ['MANUAL', 'ASSISTANT'],
      default: 'MANUAL'
    },
    messages: {
      type: [messageSchema],
      default: []
    },
    unreadForSeller: { type: Boolean, default: true },
    unreadForCustomer: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false }
  },
  { timestamps: true }
);

supportTicketSchema.index({ customer: 1, updatedAt: -1 });
supportTicketSchema.index({ seller: 1, status: 1, updatedAt: -1 });

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
