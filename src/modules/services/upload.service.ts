import { localStorageService } from '../../utils/local-storage.service';
import { ApiResult } from '../../utils/api-result';

export interface UploadConfig {
  maxFileSize: number; // in bytes
  maxFileSizeMB: number;
  allowedTypes: string[];
  maxFiles: number;
}

export class UploadService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_FILE_SIZE_MB = 5;
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  private readonly MAX_FILES = 10;

  /**
   * Get upload configuration
   */
  getUploadConfig(): ApiResult {
    const config: UploadConfig = {
      maxFileSize: this.MAX_FILE_SIZE,
      maxFileSizeMB: this.MAX_FILE_SIZE_MB,
      allowedTypes: this.ALLOWED_IMAGE_TYPES,
      maxFiles: this.MAX_FILES,
    };

    return ApiResult.success(config, 'Upload configuration retrieved successfully');
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
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
   * Upload images to local storage
   * @param files - Array of files to upload
   * @param folder - Folder to store files (e.g., 'assignments', 'orders', 'leads')
   * @returns Relative paths that should be stored in database
   */
  async uploadImages(
    files: Express.Multer.File[],
    folder: string = 'general'
  ): Promise<ApiResult> {
    try {
      if (!files || files.length === 0) {
        return ApiResult.error('No files provided', 400);
      }

      if (files.length > this.MAX_FILES) {
        return ApiResult.error(`Maximum ${this.MAX_FILES} files allowed`, 400);
      }

      // Validate all files
      const validationErrors: string[] = [];
      const validFiles: Express.Multer.File[] = [];

      for (const file of files) {
        const validation = this.validateFile(file);
        if (!validation.valid) {
          validationErrors.push(`${file.originalname}: ${validation.error}`);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) {
        return ApiResult.error(
          `All files failed validation: ${validationErrors.join('; ')}`,
          400
        );
      }

      // Upload valid files to local storage
      const fileObjects = validFiles.map((file) => ({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      }));

      // Upload files and get relative paths (e.g., 'assignments/uuid.jpg')
      const paths = await localStorageService.uploadFiles(fileObjects, folder);

      return ApiResult.success(
        {
          paths, // Return relative paths to store in database
          count: paths.length,
          errors: validationErrors.length > 0 ? validationErrors : undefined,
        },
        `Successfully uploaded ${paths.length} file(s)${validationErrors.length > 0 ? `, ${validationErrors.length} failed` : ''}`
      );
    } catch (error: any) {
      console.error('Error in uploadImages:', error);
      return ApiResult.error(error.message || 'Failed to upload images', 500);
    }
  }

  /**
   * Delete a single image from local storage
   * @param imagePath - Relative path of the image (e.g., 'assignments/uuid.jpg')
   */
  async deleteImage(imagePath: string): Promise<ApiResult> {
    try {
      if (!imagePath || typeof imagePath !== 'string') {
        return ApiResult.error('Invalid image path', 400);
      }

      const deleted = await localStorageService.deleteFile(imagePath);

      if (deleted) {
        return ApiResult.success(null, 'Image deleted successfully');
      } else {
        return ApiResult.error('Failed to delete image', 500);
      }
    } catch (error: any) {
      console.error('Error in deleteImage:', error);
      return ApiResult.error(error.message || 'Failed to delete image', 500);
    }
  }

  /**
   * Delete multiple images from local storage
   * @param imagePaths - Array of relative paths
   */
  async deleteImages(imagePaths: string[]): Promise<ApiResult> {
    try {
      if (!imagePaths || !Array.isArray(imagePaths) || imagePaths.length === 0) {
        return ApiResult.error('Invalid image paths', 400);
      }

      const result = await localStorageService.deleteFiles(imagePaths);

      return ApiResult.success(
        result,
        `Deleted ${result.deleted.length} image(s)${result.failed.length > 0 ? `, ${result.failed.length} failed` : ''}`
      );
    } catch (error: any) {
      console.error('Error in deleteImages:', error);
      return ApiResult.error(error.message || 'Failed to delete images', 500);
    }
  }

  /**
   * Get full URL for a relative path
   * @param relativePath - Relative path from database (e.g., 'assignments/uuid.jpg')
   * @returns Full URL for frontend access (e.g., '/uploads/assignments/uuid.jpg')
   */
  getFileUrl(relativePath: string): string {
    return localStorageService.getFullUrl(relativePath);
  }
}

