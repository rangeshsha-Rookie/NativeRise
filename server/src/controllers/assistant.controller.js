// server/src/controllers/assistant.controller.js
import { chatAssistant } from '../services/ai/assistant.service.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

export async function chat(req, res, next) {
  try {
    const { messages, message, history } = req.body || {};
    let normalizedMessages = messages;
    if (!normalizedMessages && message) {
      normalizedMessages = [
        ...(Array.isArray(history) ? history : []),
        { role: 'user', content: message }
      ];
    }
    if (!normalizedMessages || !Array.isArray(normalizedMessages) || normalizedMessages.length === 0) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'messages array or message is required');
    }

    const lang = req.lang || req.user?.preferredLang || 'en';
    const result = await chatAssistant({
      user: req.user || { role: 'customer', name: { en: 'Guest Customer', mr: 'ग्राहक' } },
      messages: normalizedMessages,
      lang
    });

    res.json({
      ok: true,
      data: result,
      ...result
    });
  } catch (err) {
    next(err);
  }
}
