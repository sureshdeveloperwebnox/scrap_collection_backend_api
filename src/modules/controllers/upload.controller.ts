import { Request, Response, NextFunction } from 'express';
import { Controller } from '../../decorators/controller.decorator';
import { GET, POST, DELETE } from '../../decorators/method.decorator';
import { Middleware } from '../../decorators/middleware.decorator';
import { UploadService } from '../services/upload.service';
import { ApiResult } from '../../utils/api-result';
import { uploadImages } from '../../middlewares/upload.middleware';

@Controller('/upload')
export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  @GET('/config')
  public async getUploadConfig(req: Request, res: Response): Promise<void> {
    try {
      const result = this.uploadService.getUploadConfig();
      result.send(res);
    } catch (error) {
      console.log('Error in getUploadConfig', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @POST('/images')
  @Middleware([
    (req: Request, res: Response, next: NextFunction) => {
      uploadImages(req, res, (err: any) => {
        if (err) {
          return ApiResult.error(err.message || 'File upload error', 400).send(res);
        }
        next();
      });
    }
  ])
  public async uploadImages(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      // Folder parameter: 'assignments', 'orders', 'leads', 'general', etc.
      const folder = (req.query.folder as string) || 'general';

      if (!files || files.length === 0) {
        ApiResult.error('No files provided', 400).send(res);
        return;
      }

      const result = await this.uploadService.uploadImages(files, folder);
      result.send(res);
    } catch (error) {
      console.log('Error in uploadImages', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/images')
  public async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { path, url } = req.body; // Support both 'path' and 'url' for backward compatibility

      const imagePath = path || url;
      if (!imagePath) {
        ApiResult.error('Image path is required', 400).send(res);
        return;
      }

      const result = await this.uploadService.deleteImage(imagePath);
      result.send(res);
    } catch (error) {
      console.log('Error in deleteImage', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }

  @DELETE('/images/bulk')
  public async deleteImages(req: Request, res: Response): Promise<void> {
    try {
      const { paths, urls } = req.body; // Support both 'paths' and 'urls' for backward compatibility

      const imagePaths = paths || urls;
      if (!imagePaths || !Array.isArray(imagePaths)) {
        ApiResult.error('Image paths array is required', 400).send(res);
        return;
      }

      const result = await this.uploadService.deleteImages(imagePaths);
      result.send(res);
    } catch (error) {
      console.log('Error in deleteImages', error);
      ApiResult.error((error as any).message, 500).send(res);
    }
  }
}

