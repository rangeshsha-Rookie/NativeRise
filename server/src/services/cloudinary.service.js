// server/src/services/cloudinary.service.js
import { v2 as cloudinary } from 'cloudinary';
import config from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadImageBuffer(buffer, folder = 'nativerise') {
  if (!buffer || buffer.length === 0) {
    throw new HttpError(400, CODES.UPLOAD_FAILED, null, 'Empty buffer received');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp',
        quality: 80
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary:upload] Error:', error);
          return reject(new HttpError(502, CODES.UPLOAD_FAILED, { error: error.message }, 'Image upload failed'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export default {
  uploadImageBuffer
};
