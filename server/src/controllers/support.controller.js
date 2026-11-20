// server/src/controllers/support.controller.js
import SupportTicket from '../models/SupportTicket.js';
import Order from '../models/Order.js';
import SellerProfile from '../models/SellerProfile.js';
import { ensureBilingual, hasDevanagari } from '../services/translate.service.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { pick } from '../utils/pick.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

function generateTicketNo() {
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(100 + Math.random() * 900);
  return `TK-${ts}-${rand}`;
}

/**
 * POST /support/tickets
 * Customer creates a support ticket
 */
export async function createTicket(req, res, next) {
  try {
    const { orderId, sellerId, subject, message } = req.body;

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Subject is required');
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Message is required');
    }

    let targetSellerId = sellerId;
    let targetOrder = null;

    if (orderId) {
      targetOrder = await Order.findById(orderId);
      if (!targetOrder) {
        throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
      }
      if (targetOrder.customer.toString() !== req.user._id.toString()) {
        throw new HttpError(403, CODES.AUTH_FORBIDDEN, null, 'Order does not belong to you');
      }
      targetSellerId = targetOrder.seller;
    }

    if (!targetSellerId) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Either orderId or sellerId is required');
    }

    const seller = await SellerProfile.findById(targetSellerId);
    if (!seller) {
      throw new HttpError(404, CODES.SELLER_NOT_FOUND, null, 'Seller not found');
    }

    const cleanSubject = subject.trim().slice(0, 120);
    const cleanMsg = message.trim();
    const isMr = hasDevanagari(cleanMsg);
    const bilingualMsg = await ensureBilingual(
      isMr ? { en: '', mr: cleanMsg } : { en: cleanMsg, mr: '' },
      'translate'
    );

    const ticketNo = generateTicketNo();

    const ticket = await SupportTicket.create({
      ticketNo,
      customer: req.user._id,
      seller: seller._id,
      order: targetOrder ? targetOrder._id : null,
      subject: cleanSubject,
      status: 'OPEN',
      createdVia: req.body.createdVia === 'ASSISTANT' ? 'ASSISTANT' : 'MANUAL',
      messages: [
        {
          sender: 'customer',
          text: bilingualMsg,
          originalLang: req.lang || 'en',
          at: new Date()
        }
      ],
      unreadForSeller: true,
      unreadForCustomer: false
    });

    res.status(201).json({
      id: ticket._id.toString(),
      ticketNo: ticket.ticketNo,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /support/tickets
 * Customer lists their tickets
 */
export async function getCustomerTickets(req, res, next) {
  try {
    const { page, pageSize, skip, limit } = parsePagination(req.query);

    const filter = { customer: req.user._id };
    const [total, tickets] = await Promise.all([
      SupportTicket.countDocuments(filter),
      SupportTicket.find(filter)
        .sort({ unreadForCustomer: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('seller', 'shopName')
        .populate('order', 'orderNo')
        .lean()
    ]);

    const items = tickets.map((t) => ({
      id: t._id.toString(),
      ticketNo: t.ticketNo,
      subject: t.subject,
      status: t.status,
      unread: t.unreadForCustomer,
      sellerShopName: t.seller ? pick(t.seller.shopName, req.lang) : '',
      orderNo: t.order?.orderNo || null,
      lastMessage: t.messages?.[t.messages.length - 1]?.text
        ? pick(t.messages[t.messages.length - 1].text, req.lang)
        : '',
      updatedAt: t.updatedAt
    }));

    res.json({
      items,
      meta: buildPaginationMeta(total, page, pageSize)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /support/tickets/:id
 * Customer gets ticket details and messages
 */
export async function getCustomerTicketById(req, res, next) {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findOne({ _id: id, customer: req.user._id })
      .populate('seller', 'shopName location')
      .populate('order', 'orderNo status totalPayablePaise createdAt')
      .lean();

    if (!ticket) {
      throw new HttpError(404, CODES.TICKET_NOT_FOUND, null, 'Ticket not found');
    }

    // Mark read for customer
    await SupportTicket.findByIdAndUpdate(id, { unreadForCustomer: false });

    res.json({
      id: ticket._id.toString(),
      ticketNo: ticket.ticketNo,
      subject: ticket.subject,
      status: ticket.status,
      sellerShopName: ticket.seller ? pick(ticket.seller.shopName, req.lang) : '',
      order: ticket.order
        ? {
            id: ticket.order._id.toString(),
            orderNo: ticket.order.orderNo,
            status: ticket.order.status,
            totalPayablePaise: ticket.order.totalPayablePaise,
            createdAt: ticket.order.createdAt
          }
        : null,
      messages: (ticket.messages || []).map((m) => ({
        id: m._id ? m._id.toString() : '',
        sender: m.sender,
        text: pick(m.text, req.lang),
        at: m.at
      }))
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /support/tickets/:id/messages
 * Customer replies to a ticket
 */
export async function replyCustomerTicket(req, res, next) {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Message text is required');
    }

    const ticket = await SupportTicket.findOne({ _id: id, customer: req.user._id });
    if (!ticket) {
      throw new HttpError(404, CODES.TICKET_NOT_FOUND, null, 'Ticket not found');
    }

    if (ticket.status === 'RESOLVED') {
      throw new HttpError(400, CODES.TICKET_CLOSED, null, 'This ticket is already resolved and closed');
    }

    const cleanMsg = text.trim();
    const isMr = hasDevanagari(cleanMsg);
    const bilingualMsg = await ensureBilingual(
      isMr ? { en: '', mr: cleanMsg } : { en: cleanMsg, mr: '' },
      'translate'
    );

    ticket.messages.push({
      sender: 'customer',
      text: bilingualMsg,
      originalLang: req.lang || 'en',
      at: new Date()
    });

    ticket.unreadForSeller = true;
    ticket.unreadForCustomer = false;
    await ticket.save();

    res.json({ success: true, messageCount: ticket.messages.length });
  } catch (err) {
    next(err);
  }
}
