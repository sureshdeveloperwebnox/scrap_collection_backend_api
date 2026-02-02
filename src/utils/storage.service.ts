import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * Storage Service for Digital Ocean Spaces (S3-compatible)
 * Handles file uploads, deletions, and management
 */
export class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;
  private baseUrl: string;
  private folderName: string;

  constructor() {
    // Initialize S3 client for Digital Ocean Spaces
    this.bucketName = (process.env.BUCKET_NAME || '').trim();
    this.region = (process.env.REGION || 'blr1').trim();
    // Base URL should not include trailing slash
    this.baseUrl = (process.env.BASE_URL || '').trim().replace(/\/$/, '');
    this.folderName = (process.env.FOLDER_NAME || 'Scrap_Service').trim();

    if (!process.env.ACCESS_KEY || !process.env.SECRET_ACCESS_KEY) {
      console.warn('WARNING: Digital Ocean Spaces credentials are not configured. File uploads will fail.');
      this.s3Client = null as any;
      return;
    }

    if (!this.bucketName || !this.baseUrl) {
      console.warn('WARNING: BUCKET_NAME and BASE_URL are not configured. File uploads will fail.');
      this.s3Client = null as any;
      return;
    }

    this.s3Client = new S3Client({
      endpoint: `https://${this.region}.digitaloceanspaces.com`,
      region: this.region,
      credentials: {
        accessKeyId: (process.env.ACCESS_KEY || '').trim(),
        secretAccessKey: (process.env.SECRET_ACCESS_KEY || '').trim(),
      },
      forcePathStyle: false,
    });
  }

  private checkConfig() {
    if (!this.s3Client) {
      throw new Error('Digital Ocean Spaces credentials are not configured');
    }
  }

  /**
   * Get the base URL for constructing full image URLs
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
    // Construct full URL (baseUrl already has no trailing slash)
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return `${this.baseUrl}/${cleanPath}`;
  }

  /**
   * Extract relative path from full URL
   */
  getRelativePath(fullUrl: string): string {
    if (!fullUrl) return '';
    // If already a relative path, return as is
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      return fullUrl;
    }
    // Extract path from URL
    try {
      const url = new URL(fullUrl);
      return url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
    } catch {
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
  async uploadFile(
    file: Buffer,
    fileName: string,
    folder: string = 'lead/vehicles/images',
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    this.checkConfig();
    try {
      // Generate unique filename
      const fileExtension = path.extname(fileName);
      const uniqueFileName = `${uuidv4()}${fileExtension}`;
      const key = `${this.folderName}/${folder}/${uniqueFileName}`;

      // Upload to Digital Ocean Spaces
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read', // Make files publicly accessible
      });

      await this.s3Client.send(command);

      // Return relative path only (not full URL)
      return key;
    } catch (error: any) {
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
  async uploadFiles(
    files: Array<{ buffer: Buffer; originalname: string; mimetype: string }>,
    folder: string = 'lead/vehicles/images'
  ): Promise<string[]> {
    this.checkConfig();
    const uploadPromises = files.map((file) =>
      this.uploadFile(file.buffer, file.originalname, folder, file.mimetype)
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
   * Delete a file from Digital Ocean Spaces
   * @param filePath - Relative path or full URL of the file to delete
   * @returns true if successful
   */
  async deleteFile(filePath: string): Promise<boolean> {
    this.checkConfig();
    try {
      // Extract relative path (handle both full URL and relative path)
      const key = this.getRelativePath(filePath);

      if (!key) {
        throw new Error('Invalid file path');
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      console.error('Error deleting file from Digital Ocean Spaces:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   * @param filePaths - Array of relative paths or full URLs
   * @returns Object with deleted and failed paths
   */
  async deleteFiles(filePaths: string[]): Promise<{ deleted: string[]; failed: string[] }> {
    const deleted: string[] = [];
    const failed: string[] = [];

    const deletePromises = filePaths.map(async (path) => {
      try {
        await this.deleteFile(path);
        deleted.push(path);
      } catch (error) {
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
  async fileExists(filePath: string): Promise<boolean> {
    this.checkConfig();
    try {
      const key = this.getRelativePath(filePath);

      if (!key) {
        return false;
      }

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }
}

const STORAGE_NOT_CONFIGURED =
  'Digital Ocean Spaces credentials are not configured. Set ACCESS_KEY, SECRET_ACCESS_KEY, BUCKET_NAME, and BASE_URL.';

/**
 * No-op storage when DO Spaces credentials are missing.
 * Allows the backend to start; upload/delete will throw if used.
 */
class NoOpStorageService {
  getBaseUrl(): string {
    return '';
  }

  getFullUrl(relativePath: string): string {
    if (!relativePath) return '';
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    return relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  }

  getRelativePath(fullUrl: string): string {
    if (!fullUrl) return '';
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      return fullUrl;
    }
    try {
      const url = new URL(fullUrl);
      return url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
    } catch {
      return fullUrl;
    }
  }

  async uploadFile(): Promise<string> {
    throw new Error(STORAGE_NOT_CONFIGURED);
  }

  async uploadFiles(): Promise<string[]> {
    throw new Error(STORAGE_NOT_CONFIGURED);
  }

  async deleteFile(): Promise<boolean> {
    throw new Error(STORAGE_NOT_CONFIGURED);
  }

  async deleteFiles(): Promise<{ deleted: string[]; failed: string[] }> {
    throw new Error(STORAGE_NOT_CONFIGURED);
  }

  async fileExists(): Promise<boolean> {
    return false;
  }
}

function hasStorageConfig(): boolean {
  const access = (process.env.ACCESS_KEY || '').trim();
  const secret = (process.env.SECRET_ACCESS_KEY || '').trim();
  const bucket = (process.env.BUCKET_NAME || '').trim();
  const base = (process.env.BASE_URL || '').trim();
  return Boolean(access && secret && bucket && base);
}

// Export singleton: real StorageService when configured, no-op otherwise so backend can start
export const storageService = hasStorageConfig()
  ? new StorageService()
  : (() => {
      console.warn(
        'Storage: Digital Ocean Spaces not configured (ACCESS_KEY, SECRET_ACCESS_KEY, BUCKET_NAME, BASE_URL). File uploads will fail until configured.'
      );
      return new NoOpStorageService();
    })();

