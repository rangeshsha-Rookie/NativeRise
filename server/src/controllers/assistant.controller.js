// server/src/controllers/assistant.controller.js
import { chatAssistant } from '../services/ai/assistant.service.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

export async function chat(req, res, next) {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new HttpError(400, CODES.VALIDATION_FAILED, null, 'messages array is required');
    }

    const lang = req.lang || req.user.preferredLang || 'en';
    const result = await chatAssistant({
      user: req.user,
      messages,
      lang
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}
