"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const storage_service_1 = require("../../utils/storage.service");
const api_result_1 = require("../../utils/api-result");
class UploadService {
    constructor() {
        this.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        this.MAX_FILE_SIZE_MB = 5;
        this.ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        this.MAX_FILES = 10;
    }
    /**
     * Get upload configuration
     */
    getUploadConfig() {
        const config = {
            maxFileSize: this.MAX_FILE_SIZE,
            maxFileSizeMB: this.MAX_FILE_SIZE_MB,
            allowedTypes: this.ALLOWED_IMAGE_TYPES,
            maxFiles: this.MAX_FILES,
        };
        return api_result_1.ApiResult.success(config, 'Upload configuration retrieved successfully');
    }
    /**
     * Validate file before upload
     */
    validateFile(file) {
        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE_MB}MB`,
            };
        }
        // Check file type
        if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return {
                valid: false,
                error: `File type ${file.mimetype} is not allowed. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
            };
        }
        // Check if file has content
        if (!file.buffer || file.buffer.length === 0) {
            return {
                valid: false,
                error: 'File is empty',
            };
        }
        return { valid: true };
    }
    /**
     * Upload images
     */
    async uploadImages(files, folder = 'lead/vehicles/images') {
        try {
            if (!files || files.length === 0) {
                return api_result_1.ApiResult.error('No files provided', 400);
            }
            if (files.length > this.MAX_FILES) {
                return api_result_1.ApiResult.error(`Maximum ${this.MAX_FILES} files allowed`, 400);
            }
            // Validate all files
            const validationErrors = [];
            const validFiles = [];
            for (const file of files) {
                const validation = this.validateFile(file);
                if (!validation.valid) {
                    validationErrors.push(`${file.originalname}: ${validation.error}`);
                }
                else {
                    validFiles.push(file);
                }
            }
            if (validFiles.length === 0) {
                return api_result_1.ApiResult.error(`All files failed validation: ${validationErrors.join('; ')}`, 400);
            }
            // Upload valid files
            const fileObjects = validFiles.map((file) => ({
                buffer: file.buffer,
                originalname: file.originalname,
                mimetype: file.mimetype,
            }));
            // Upload files and get relative paths (not full URLs)
            const paths = await storage_service_1.storageService.uploadFiles(fileObjects, folder);
            return api_result_1.ApiResult.success({
                paths, // Return relative paths
                count: paths.length,
                errors: validationErrors.length > 0 ? validationErrors : undefined,
            }, `Successfully uploaded ${paths.length} file(s)${validationErrors.length > 0 ? `, ${validationErrors.length} failed` : ''}`);
        }
        catch (error) {
            console.error('Error in uploadImages:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to upload images', 500);
        }
    }
    /**
     * Delete a single image
     * @param imagePath - Relative path or full URL of the image
     */
    async deleteImage(imagePath) {
        try {
            if (!imagePath || typeof imagePath !== 'string') {
                return api_result_1.ApiResult.error('Invalid image path', 400);
            }
            const deleted = await storage_service_1.storageService.deleteFile(imagePath);
            if (deleted) {
                return api_result_1.ApiResult.success(null, 'Image deleted successfully');
            }
            else {
                return api_result_1.ApiResult.error('Failed to delete image', 500);
            }
        }
        catch (error) {
            console.error('Error in deleteImage:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to delete image', 500);
        }
    }
    /**
     * Delete multiple images
     * @param imagePaths - Array of relative paths or full URLs
     */
    async deleteImages(imagePaths) {
        try {
            if (!imagePaths || !Array.isArray(imagePaths) || imagePaths.length === 0) {
                return api_result_1.ApiResult.error('Invalid image paths', 400);
            }
            const result = await storage_service_1.storageService.deleteFiles(imagePaths);
            return api_result_1.ApiResult.success(result, `Deleted ${result.deleted.length} image(s)${result.failed.length > 0 ? `, ${result.failed.length} failed` : ''}`);
        }
        catch (error) {
            console.error('Error in deleteImages:', error);
            return api_result_1.ApiResult.error(error.message || 'Failed to delete images', 500);
        }
    }
}
exports.UploadService = UploadService;
