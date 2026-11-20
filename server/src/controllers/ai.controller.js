// server/src/controllers/ai.controller.js
import SupportTicket from '../models/SupportTicket.js';
import { getWhatToSellIdeas } from '../services/ai/whatToSell.service.js';
import { parseSnapSell, parseVoiceListing, describeProduct } from '../services/ai/snapSell.service.js';
import { getGrowthCoachReport } from '../services/ai/growth.service.js';
import { generateText } from '../services/ai/gemini.client.js';
import { TICKET_REPLY_SYSTEM } from '../config/prompts.js';
import { pick } from '../utils/pick.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

/**
 * POST /ai/what-to-sell [seller]
 */
export async function postWhatToSell(req, res, next) {
  try {
    const { resources, skillsText, budgetBand, hoursPerDay } = req.body;
    const lang = req.lang || req.user.preferredLang || 'en';

    const ideas = await getWhatToSellIdeas({
      sellerProfile: req.sellerProfile,
      resources,
      skillsText,
      budgetBand,
      hoursPerDay,
      lang
    });

    res.json({ ok: true, data: { ideas } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /ai/snap-and-sell [seller]
 */
export async function postSnapAndSell(req, res, next) {
  try {
    const lang = req.lang || req.user.preferredLang || 'en';
    const transcript = req.body?.transcript || '';

    let imageBase64 = null;
    let mimeType = 'image/jpeg';

    if (req.file && req.file.buffer) {
      imageBase64 = req.file.buffer.toString('base64');
      mimeType = req.file.mimetype || 'image/jpeg';
    } else if (req.body?.image) {
      imageBase64 = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    }

    const data = await parseSnapSell({
      imageBase64,
      mimeType,
      transcript,
      lang
    });

    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /ai/voice-to-listing [seller]
 */
export async function postVoiceToListing(req, res, next) {
  try {
    const { transcript } = req.body;
    const lang = req.lang || req.user.preferredLang || 'en';

    if (!transcript) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'transcript is required');
    }

    const data = await parseVoiceListing({ transcript, lang });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /ai/describe [seller]
 */
export async function postDescribe(req, res, next) {
  try {
    const { name, details, category } = req.body;
    const lang = req.lang || req.user.preferredLang || 'en';

    if (!name) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'Product name is required');
    }

    const data = await describeProduct({ name, details, category, lang });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /ai/growth-coach [seller]
 */
export async function getGrowthCoach(req, res, next) {
  try {
    const refresh = req.query.refresh === '1' || req.query.refresh === 'true';
    const lang = req.lang || req.user.preferredLang || 'en';

    const data = await getGrowthCoachReport({
      sellerProfile: req.sellerProfile,
      refresh,
      lang
    });

    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /ai/support/draft-reply [seller]
 */
export async function postDraftReply(req, res, next) {
  try {
    const { ticketId } = req.body;
    const lang = req.lang || req.user.preferredLang || 'en';
    const isMr = lang === 'mr';

    if (!ticketId) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'ticketId is required');
    }

    const ticket = await SupportTicket.findOne({
      _id: ticketId,
      seller: req.sellerProfile._id
    })
      .populate('order', 'orderNo status')
      .populate('customer', 'name')
      .lean();

    if (!ticket) {
      throw new HttpError(404, CODES.TICKET_NOT_FOUND, null, 'Ticket not found');
    }

    const lastMsg = ticket.messages?.[ticket.messages.length - 1];
    const customerText = lastMsg ? pick(lastMsg.text, lang) : '';

    let draft = '';
    try {
      const prompt = `Customer message: "${customerText}". Subject: "${ticket.subject}". Order status: ${ticket.order?.status || 'N/A'}. Respond in ${isMr ? 'Marathi' : 'English'}. Keep polite, brief (under 50 words) and helpful.`;
      draft = await generateText({
        system: TICKET_REPLY_SYSTEM,
        user: prompt,
        temperature: 0.3
      });
    } catch {
      draft = isMr
        ? `नमस्कार, आपली अडचण समजली. आम्ही यावर काम करत असून लवकरच तुम्हाला अपडेट देऊ.`
        : `Hello, thank you for reaching out. We have noted your request and will assist you shortly.`;
    }

    res.json({ ok: true, data: { draft } });
  } catch (err) {
    next(err);
  }
}
