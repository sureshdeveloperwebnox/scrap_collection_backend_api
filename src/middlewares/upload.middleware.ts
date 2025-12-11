import multer from 'multer';
import { Request } from 'express';

/**
 * Multer configuration for file uploads
 * Stores files in memory as buffers for direct upload to Digital Ocean Spaces
 */
const storage = multer.memoryStorage();

/**
 * File filter to validate file types
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

/**
 * Multer upload middleware configuration
 */
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10, // Maximum 10 files
  },
});

/**
 * Middleware for uploading multiple images
 */
export const uploadImages = uploadMiddleware.array('images', 10);

/**
 * Middleware for uploading a single image
 */
export const uploadSingleImage = uploadMiddleware.single('image');

