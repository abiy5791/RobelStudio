# Multiple Image Upload Support

This document explains how to use the multiple image upload functionality that has been added to the RobelStudio project.

## Features Added

### 1. Enhanced Admin Interface
- **Portfolio Images**: Increased inline forms to 5 for easier bulk entry
- **Service Gallery Images**: Increased inline forms to 5 for easier bulk entry
- **Portfolio Categories**: Added inline forms for direct image management

### 2. API Endpoints for Bulk Upload

#### Portfolio Images Bulk Upload
```
POST /api/uploads/portfolio/
```
**Parameters:**
- `category_id`: ID of the portfolio category
- `images`: Multiple image files

**Example Usage:**
```javascript
const formData = new FormData();
formData.append('category_id', '1');
formData.append('images', file1);
formData.append('images', file2);
formData.append('images', file3);

fetch('/api/uploads/portfolio/', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### Service Gallery Images Bulk Upload
```
POST /api/uploads/service/
```
**Parameters:**
- `service_id`: ID of the service
- `images`: Multiple image files

**Example Usage:**
```javascript
const formData = new FormData();
formData.append('service_id', '1');
formData.append('images', file1);
formData.append('images', file2);

fetch('/api/uploads/service/', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. Management Command for Bulk Upload

Upload images from a directory using the management command:

#### Portfolio Images
```bash
python manage.py bulk_upload_images /path/to/images --type portfolio --category "Wedding Photography"
```

#### Service Gallery Images
```bash
python manage.py bulk_upload_images /path/to/images --type service --service "Wedding Photography"
```

**Supported Image Formats:**
- .jpg, .jpeg, .png, .gif, .webp

### 4. React Component for Frontend

A `MultipleImageUpload` component has been created for easy integration:

```jsx
import MultipleImageUpload from './components/MultipleImageUpload';

// For portfolio images
<MultipleImageUpload 
  type="portfolio" 
  categoryId={categoryId}
  onUpload={(result) => console.log('Uploaded:', result)}
/>

// For service gallery images
<MultipleImageUpload 
  type="service" 
  serviceId={serviceId}
  onUpload={(result) => console.log('Uploaded:', result)}
/>
```

## Key Benefits

1. **Efficient Bulk Operations**: Upload multiple images at once instead of one by one
2. **Automatic Ordering**: Images are automatically ordered based on upload sequence
3. **API-First Approach**: RESTful endpoints for integration with any frontend
4. **Command Line Support**: Bulk upload from directories for initial data population
5. **Preview Functionality**: Frontend component shows image previews before upload
6. **Error Handling**: Proper error messages and validation

## File Organization

Images are automatically organized in the following structure:
- Portfolio images: `media/portfolio/YYYY/MM/`
- Service gallery images: `media/services/YYYY/MM/`
- Testimonial avatars: `media/testimonials/`

## Usage Examples

### 1. Admin Interface
1. Go to Django Admin
2. Navigate to Portfolio Categories or Services
3. Use the inline forms to add multiple images at once
4. Set appropriate order values for image sequence

### 2. API Integration
Use the provided API endpoints in your frontend application to allow users to upload multiple images through a web interface.

### 3. Bulk Data Import
Use the management command to quickly populate your database with images from existing directories.

## Technical Implementation

- **Models**: Enhanced with proper relationships and ordering
- **Serializers**: Support for multiple image handling with URL building
- **Views**: Bulk upload endpoints with proper error handling
- **Admin**: Simplified interface focusing on individual uploads with API support for bulk operations
- **Frontend**: React component with drag-and-drop and preview functionality

This implementation provides a complete solution for handling multiple image uploads across the entire application stack.