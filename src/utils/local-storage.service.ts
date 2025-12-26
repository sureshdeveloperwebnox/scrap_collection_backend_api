import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

/**
 * Local Storage Service
 * Handles file uploads to local filesystem and stores only paths in database
 */
export class LocalStorageService {
    private uploadDir: string;
    private baseUrl: string;

    constructor() {
        // Base directory for uploads (relative to project root)
        this.uploadDir = process.env.UPLOAD_DIR || 'uploads';

        // Base URL for serving files (for frontend access)
        this.baseUrl = process.env.UPLOAD_BASE_URL || '/uploads';

        // Ensure upload directory exists
        this.ensureUploadDir();
    }

    /**
     * Ensure upload directory exists
     */
    private async ensureUploadDir(): Promise<void> {
        try {
            await access(this.uploadDir);
        } catch {
            // Directory doesn't exist, create it
            await mkdir(this.uploadDir, { recursive: true });
            console.log(`Created upload directory: ${this.uploadDir}`);
        }
    }

    /**
     * Ensure a specific folder exists within upload directory
     */
    private async ensureFolder(folder: string): Promise<void> {
        const folderPath = path.join(this.uploadDir, folder);
        try {
            await access(folderPath);
        } catch {
            await mkdir(folderPath, { recursive: true });
        }
    }

    /**
     * Get the base URL for constructing file URLs
     */
    getBaseUrl(): string {
        return this.baseUrl;
    }

    /**
     * Construct full URL from relative path
     */
    getFullUrl(relativePath: string): string {
        if (!relativePath) return '';

        // If already a full URL, return as is
        if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath;
        }

        // If path starts with /uploads, it's already a URL path
        if (relativePath.startsWith('/uploads')) {
            return relativePath;
        }

        // Construct URL path
        const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
        return `${this.baseUrl}${cleanPath}`;
    }

    /**
     * Get file system path from relative path
     */
    private getFilePath(relativePath: string): string {
        // Remove /uploads prefix if present
        const cleanPath = relativePath.replace(/^\/uploads\//, '');
        return path.join(this.uploadDir, cleanPath);
    }

    /**
     * Upload a file to local filesystem
     * @param file - File buffer
     * @param fileName - Original file name
     * @param folder - Folder path (e.g., 'assignments', 'orders', 'leads')
     * @returns Relative path of the uploaded file (e.g., 'assignments/uuid.jpg')
     */
    async uploadFile(
        file: Buffer,
        fileName: string,
        folder: string = 'general'
    ): Promise<string> {
        try {
            // Ensure folder exists
            await this.ensureFolder(folder);

            // Generate unique filename
            const fileExtension = path.extname(fileName);
            const uniqueFileName = `${uuidv4()}${fileExtension}`;

            // Relative path (stored in database)
            const relativePath = `${folder}/${uniqueFileName}`;

            // Full file system path
            const filePath = path.join(this.uploadDir, relativePath);

            // Write file to disk
            await writeFile(filePath, file);

            console.log(`File uploaded: ${relativePath}`);

            // Return relative path (this is what gets stored in DB)
            return relativePath;
        } catch (error: any) {
            console.error('Error uploading file to local storage:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }

    /**
     * Upload multiple files
     * @param files - Array of file objects with buffer and originalname
     * @param folder - Folder path (e.g., 'assignments', 'orders')
     * @returns Array of relative paths
     */
    async uploadFiles(
        files: Array<{ buffer: Buffer; originalname: string; mimetype?: string }>,
        folder: string = 'general'
    ): Promise<string[]> {
        const uploadPromises = files.map((file) =>
            this.uploadFile(file.buffer, file.originalname, folder)
        );

        try {
            const paths = await Promise.all(uploadPromises);
            return paths;
        } catch (error: any) {
            console.error('Error uploading multiple files:', error);
            throw new Error(`Failed to upload files: ${error.message}`);
        }
    }

    /**
     * Delete a file from local filesystem
     * @param relativePath - Relative path of the file (e.g., 'assignments/uuid.jpg')
     * @returns true if successful
     */
    async deleteFile(relativePath: string): Promise<boolean> {
        try {
            if (!relativePath) {
                throw new Error('Invalid file path');
            }

            const filePath = this.getFilePath(relativePath);

            // Check if file exists
            try {
                await access(filePath);
            } catch {
                console.warn(`File not found: ${filePath}`);
                return false;
            }

            // Delete file
            await unlink(filePath);
            console.log(`File deleted: ${relativePath}`);
            return true;
        } catch (error: any) {
            console.error('Error deleting file from local storage:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    /**
     * Delete multiple files
     * @param relativePaths - Array of relative paths
     * @returns Object with deleted and failed paths
     */
    async deleteFiles(relativePaths: string[]): Promise<{ deleted: string[]; failed: string[] }> {
        const deleted: string[] = [];
        const failed: string[] = [];

        const deletePromises = relativePaths.map(async (path) => {
            try {
                const success = await this.deleteFile(path);
                if (success) {
                    deleted.push(path);
                } else {
                    failed.push(path);
                }
            } catch (error) {
                failed.push(path);
            }
        });

        await Promise.all(deletePromises);

        return { deleted, failed };
    }

    /**
     * Check if a file exists
     * @param relativePath - Relative path of the file
     * @returns true if file exists
     */
    async fileExists(relativePath: string): Promise<boolean> {
        try {
            if (!relativePath) {
                return false;
            }

            const filePath = this.getFilePath(relativePath);
            await access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get file stats
     * @param relativePath - Relative path of the file
     * @returns File stats or null
     */
    async getFileStats(relativePath: string): Promise<fs.Stats | null> {
        try {
            const filePath = this.getFilePath(relativePath);
            return fs.statSync(filePath);
        } catch {
            return null;
        }
    }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
