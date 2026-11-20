// server/src/utils/httpError.js

export class HttpError extends Error {
  constructor(statusCode, code, details = null, message = null) {
    super(message || code);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export default HttpError;
