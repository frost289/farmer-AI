import multer from 'multer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED = ['image/jpeg', 'image/png'];

// Memory storage: the service layer decides where the file goes (config/storage.js).
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.uploadMaxBytes, files: 1 },
  fileFilter: (_req, file, cb) =>
    ALLOWED.includes(file.mimetype)
      ? cb(null, true)
      : cb(new ApiError(400, 'INVALID_IMAGE', 'Only JPEG or PNG images are allowed')),
}).single('image');
