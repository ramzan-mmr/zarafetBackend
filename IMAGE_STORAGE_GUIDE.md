# Image Storage System

## Overview
The system now converts base64 image data to actual image files and stores them locally with a proper folder structure. Images are optimized and stored as URLs in the database.

## Folder Structure
```
uploads/
├── products/
│   ├── 1/                    # Product ID 1
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   └── variants/
│   │       ├── variant1.jpg
│   │       └── variant2.jpg
│   ├── 2/                    # Product ID 2
│   │   └── image1.jpg
│   └── ...
```

## How It Works

### 1. Image Processing
- **Base64 Detection**: Automatically detects base64 image data (starts with `data:image/`)
- **Image Optimization**: Uses Sharp library to:
  - Resize images (max 1200x1200 for products, 800x800 for variants)
  - Compress to 85% quality
  - Convert to JPEG format
  - Generate unique filenames using UUID

### 2. Storage Process
1. **Convert**: Base64 → Buffer → Optimized Buffer
2. **Store**: Save to `uploads/products/{productId}/filename.jpg`
3. **URL**: Generate public URL like `http://localhost:3000/uploads/products/1/abc123.jpg`
4. **Database**: Store URL in `product_images` table

### 3. API Endpoints
- **Static Files**: `GET /uploads/products/1/image.jpg` - Serves images directly
- **Product Images**: Stored in `uploads/products/{productId}/`
- **Variant Images**: Stored in `uploads/products/{productId}/variants/`

## Environment Variables
Add these to your `.env` file:
```env
UPLOADS_DIR=uploads
BASE_URL=http://localhost:3000
```

## Database Changes
- **No schema changes needed** - existing `product_images` table works perfectly
- **URLs stored**: Instead of base64 data, URLs are stored
- **Automatic cleanup**: Old images are deleted when products are updated/deleted

## Features
✅ **Base64 to Image Conversion**  
✅ **Image Optimization** (resize, compress, format conversion)  
✅ **Organized Storage** (folder structure by product ID)  
✅ **Automatic Cleanup** (delete old images on update/delete)  
✅ **Error Handling** (continues if image processing fails)  
✅ **Static File Serving** (images accessible via HTTP)  
✅ **Variant Support** (color images for product variants)  

## Example Usage

### Frontend Request
```javascript
const productData = {
  name: "Test Product",
  price: 100,
  images: [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", // Base64 image
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."  // Another base64 image
  ],
  variants: [
    {
      size: "M",
      color_name: "Red",
      color_image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." // Base64 variant image
    }
  ]
};
```

### Backend Processing
1. **Detects base64 images** in `images` and `variants[].color_image`
2. **Processes each image**:
   - Converts base64 to buffer
   - Optimizes (resize, compress)
   - Saves to `uploads/products/{productId}/uuid.jpg`
3. **Stores URLs** in database:
   - `http://localhost:3000/uploads/products/1/abc123.jpg`
   - `http://localhost:3000/uploads/products/1/def456.jpg`

### Result
- **Database**: URLs stored instead of base64 data
- **File System**: Images saved in organized folders
- **API Response**: Returns image URLs that can be directly used in frontend
- **Performance**: Optimized images load faster than base64

## Error Handling
- If image processing fails, product creation continues
- Old images are automatically cleaned up
- Graceful fallback for missing images
- Detailed error logging for debugging

## Security
- Images are publicly accessible (served via Express static middleware)
- Unique filenames prevent conflicts
- No direct file system access from frontend
- Automatic cleanup prevents storage bloat
