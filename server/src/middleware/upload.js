// server/src/middleware/upload.js
import multer from 'multer';
import { IMAGE_MAX_MB } from '../config/constants.js';
import { HttpError } from '../utils/httpError.js';
import { ErrorCodes } from '../utils/codes.js';

const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: IMAGE_MAX_MB * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new HttpError(400, ErrorCodes.UPLOAD_BAD_TYPE, { allowed: allowedMimeTypes, received: file.mimetype }, 'Invalid file type'));
    }
    cb(null, true);
  }
});

export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new HttpError(400, ErrorCodes.UPLOAD_TOO_LARGE, { maxMb: IMAGE_MAX_MB }, 'File size exceeds allowed limit'));
    }
    return next(new HttpError(400, ErrorCodes.UPLOAD_FAILED, { multerCode: err.code }, err.message));
  }
  next(err);
}

export default {
  uploadImage,
  handleUploadError
};
