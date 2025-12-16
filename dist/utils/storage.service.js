"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
/**
 * Storage Service for Digital Ocean Spaces (S3-compatible)
 * Handles file uploads, deletions, and management
 */
class StorageService {
    constructor() {
        // Initialize S3 client for Digital Ocean Spaces
        this.bucketName = (process.env.BUCKET_NAME || '').trim();
        this.region = (process.env.REGION || 'blr1').trim();
        // Base URL should not include trailing slash
        this.baseUrl = (process.env.BASE_URL || '').trim().replace(/\/$/, '');
        this.folderName = (process.env.FOLDER_NAME || 'Scrap_Service').trim();
        if (!process.env.ACCESS_KEY || !process.env.SECRET_ACCESS_KEY) {
            throw new Error('Digital Ocean Spaces credentials are not configured');
        }
        if (!this.bucketName || !this.baseUrl) {
            throw new Error('BUCKET_NAME and BASE_URL must be configured in environment variables');
        }
        this.s3Client = new client_s3_1.S3Client({
            endpoint: `https://${this.region}.digitaloceanspaces.com`,
            region: this.region,
            credentials: {
                accessKeyId: (process.env.ACCESS_KEY || '').trim(),
                secretAccessKey: (process.env.SECRET_ACCESS_KEY || '').trim(),
            },
            forcePathStyle: false,
        });
    }
    /**
     * Get the base URL for constructing full image URLs
     */
    getBaseUrl() {
        return this.baseUrl;
    }
    /**
     * Construct full URL from relative path
     */
    getFullUrl(relativePath) {
        if (!relativePath)
            return '';
        // If already a full URL, return as is
        if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath;
        }
        // Construct full URL (baseUrl already has no trailing slash)
        const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
        return `${this.baseUrl}/${cleanPath}`;
    }
    /**
     * Extract relative path from full URL
     */
    getRelativePath(fullUrl) {
        if (!fullUrl)
            return '';
        // If already a relative path, return as is
        if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
            return fullUrl;
        }
        // Extract path from URL
        try {
            const url = new URL(fullUrl);
            return url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
        }
        catch (_a) {
            // If URL parsing fails, try to extract manually
            const baseUrlIndex = fullUrl.indexOf(this.baseUrl);
            if (baseUrlIndex !== -1) {
                return fullUrl.substring(baseUrlIndex + this.baseUrl.length).replace(/^\//, '');
            }
            return fullUrl;
        }
    }
    /**
     * Upload a file to Digital Ocean Spaces
     * @param file - File buffer
     * @param fileName - Original file name
     * @param folder - Folder path (e.g., 'lead/vehicles/images', 'vehicles')
     * @param contentType - MIME type
     * @returns Relative path of the uploaded file (not full URL)
     */
    async uploadFile(file, fileName, folder = 'lead/vehicles/images', contentType = 'image/jpeg') {
        try {
            // Generate unique filename
            const fileExtension = path_1.default.extname(fileName);
            const uniqueFileName = `${(0, uuid_1.v4)()}${fileExtension}`;
            const key = `${this.folderName}/${folder}/${uniqueFileName}`;
            // Upload to Digital Ocean Spaces
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file,
                ContentType: contentType,
                ACL: 'public-read', // Make files publicly accessible
            });
            await this.s3Client.send(command);
            // Return relative path only (not full URL)
            return key;
        }
        catch (error) {
            console.error('Error uploading file to Digital Ocean Spaces:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
    /**
     * Upload multiple files
     * @param files - Array of file objects with buffer, originalname, and mimetype
     * @param folder - Folder path (e.g., 'lead/vehicles/images')
     * @returns Array of relative paths (not full URLs)
     */
    async uploadFiles(files, folder = 'lead/vehicles/images') {
        const uploadPromises = files.map((file) => this.uploadFile(file.buffer, file.originalname, folder, file.mimetype));
        try {
            const paths = await Promise.all(uploadPromises);
            return paths;
        }
        catch (error) {
            console.error('Error uploading multiple files:', error);
            throw new Error(`Failed to upload files: ${error.message}`);
        }
    }
    /**
     * Delete a file from Digital Ocean Spaces
     * @param filePath - Relative path or full URL of the file to delete
     * @returns true if successful
     */
    async deleteFile(filePath) {
        try {
            // Extract relative path (handle both full URL and relative path)
            const key = this.getRelativePath(filePath);
            if (!key) {
                throw new Error('Invalid file path');
            }
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
            return true;
        }
        catch (error) {
            console.error('Error deleting file from Digital Ocean Spaces:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
    /**
     * Delete multiple files
     * @param filePaths - Array of relative paths or full URLs
     * @returns Object with deleted and failed paths
     */
    async deleteFiles(filePaths) {
        const deleted = [];
        const failed = [];
        const deletePromises = filePaths.map(async (path) => {
            try {
                await this.deleteFile(path);
                deleted.push(path);
            }
            catch (error) {
                failed.push(path);
            }
        });
        await Promise.all(deletePromises);
        return { deleted, failed };
    }
    /**
     * Check if a file exists
     * @param filePath - Relative path or full URL of the file
     * @returns true if file exists
     */
    async fileExists(filePath) {
        try {
            const key = this.getRelativePath(filePath);
            if (!key) {
                return false;
            }
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.StorageService = StorageService;
// Export singleton instance
exports.storageService = new StorageService();
