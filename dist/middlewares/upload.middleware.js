"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleImage = exports.uploadImages = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
/**
 * Multer configuration for file uploads
 * Stores files in memory as buffers for direct upload to Digital Ocean Spaces
 */
const storage = multer_1.default.memoryStorage();
/**
 * File filter to validate file types
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
    }
};
/**
 * Multer upload middleware configuration
 */
exports.uploadMiddleware = (0, multer_1.default)({
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
exports.uploadImages = exports.uploadMiddleware.array('images', 10);
/**
 * Middleware for uploading a single image
 */
exports.uploadSingleImage = exports.uploadMiddleware.single('image');
