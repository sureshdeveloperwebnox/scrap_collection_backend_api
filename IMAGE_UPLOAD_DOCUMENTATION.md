# Image Upload Module Documentation

## Overview
Production-grade image upload system for vehicle images in the Lead module, integrated with Digital Ocean Spaces (S3-compatible storage).

## Architecture

### Backend Components

1. **Storage Service** (`src/utils/storage.service.ts`)
   - Handles all interactions with Digital Ocean Spaces
   - Uses AWS SDK v3 for S3-compatible API
   - Provides methods for upload, delete, and file existence checks
   - Generates unique filenames using UUID

2. **Upload Service** (`src/modules/services/upload.service.ts`)
   - Business logic for file validation
   - File size and type validation
   - Batch upload support
   - Error handling and reporting

3. **Upload Controller** (`src/modules/controllers/upload.controller.ts`)
   - REST API endpoints for image operations
   - Integrates multer middleware for file handling
   - Error handling and response formatting

4. **Upload Middleware** (`src/middlewares/upload.middleware.ts`)
   - Multer configuration
   - File type filtering
   - Size limits enforcement

### Frontend Components

1. **ImageUpload Component** (`src/components/ui/image-upload.tsx`)
   - Reusable React component
   - Drag-and-drop support (via file input)
   - Image preview with grid layout
   - Progress indicators
   - Error handling and validation
   - Automatic server-side deletion on remove

2. **Image Upload API Client** (`src/lib/api/image-upload.ts`)
   - TypeScript API client
   - Upload, delete, and config endpoints
   - Error handling

## Environment Variables

### Backend (.env)

```env
# Digital Ocean Spaces Configuration
FOLDER_NAME=Scrap_Service
BUCKET_NAME=webnox
REGION=blr1
ACCESS_KEY=DO00KMPLVC4GKKLNCNNR
SECRET_ACCESS_KEY=5aV2hAO5XqMAm5gHQbsOjqBPbfO7NZo+KwSEQnQd/tk
BASE_URL=https://webnox.blr1.digitaloceanspaces.com/
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:9645/api/v1
```

## API Endpoints

### GET `/api/v1/upload/config`
Get upload configuration (max file size, allowed types, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "maxFileSize": 5242880,
    "maxFileSizeMB": 5,
    "allowedTypes": ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    "maxFiles": 10
  }
}
```

### POST `/api/v1/upload/images?type=vehicles`
Upload multiple images

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with `images` field (array of files)
- Query: `type` (optional, default: 'vehicles')

**Response:**
```json
{
  "success": true,
  "data": {
    "urls": ["https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/vehicles/uuid.jpg"],
    "count": 1,
    "errors": []
  }
}
```

### DELETE `/api/v1/upload/images`
Delete a single image

**Request:**
```json
{
  "url": "https://webnox.blr1.digitaloceanspaces.com/Scrap_Service/vehicles/uuid.jpg"
}
```

### DELETE `/api/v1/upload/images/bulk`
Delete multiple images

**Request:**
```json
{
  "urls": ["url1", "url2", "url3"]
}
```

## Security Features

1. **File Type Validation**
   - Only allows: JPEG, JPG, PNG, WebP, GIF
   - Validated on both client and server

2. **File Size Limits**
   - Maximum 5MB per file
   - Configurable via environment variables

3. **File Count Limits**
   - Maximum 10 files per upload
   - Configurable in service

4. **Unique Filenames**
   - UUID-based naming prevents conflicts
   - Prevents path traversal attacks

5. **Public Read Access**
   - Files are publicly accessible via CDN
   - Private uploads can be configured

## Usage Examples

### Backend Usage

```typescript
import { storageService } from './utils/storage.service';

// Upload single file
const url = await storageService.uploadFile(
  fileBuffer,
  'vehicle.jpg',
  'vehicles',
  'image/jpeg'
);

// Upload multiple files
const urls = await storageService.uploadFiles(files, 'vehicles');

// Delete file
await storageService.deleteFile(url);
```

### Frontend Usage

```tsx
import { ImageUpload } from '@/components/ui/image-upload';

function MyComponent() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <ImageUpload
      value={images}
      onChange={setImages}
      maxFiles={10}
      uploadType="vehicles"
      showPreview={true}
    />
  );
}
```

## Integration with Lead Form

The ImageUpload component is integrated into the Lead form:

```tsx
<ImageUpload
  value={formData.photos || []}
  onChange={handlePhotosChange}
  maxFiles={10}
  uploadType="vehicles"
  disabled={isLoading}
  showPreview={true}
/>
```

## File Structure

Uploaded files are organized as:
```
Scrap_Service/
  └── vehicles/
      ├── uuid1.jpg
      ├── uuid2.png
      └── ...
```

## Error Handling

- Client-side validation before upload
- Server-side validation for security
- Graceful error messages
- Failed uploads don't affect successful ones
- Automatic cleanup on component unmount

## Performance Optimizations

1. **Memory Storage**
   - Files stored in memory during upload
   - Direct stream to Digital Ocean Spaces
   - No temporary disk storage

2. **Batch Operations**
   - Multiple files uploaded in parallel
   - Efficient error handling per file

3. **CDN Delivery**
   - Files served via Digital Ocean Spaces CDN
   - Fast global access

## Future Enhancements

1. Image compression before upload
2. Thumbnail generation
3. Image cropping/editing
4. Progress tracking per file
5. Resume failed uploads
6. Private file support with signed URLs

