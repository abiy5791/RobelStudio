import os
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

class ImageProcessor:
    """Optimized image processing for high-quality photos"""
    
    THUMBNAIL_SIZE = (400, 400)
    MEDIUM_SIZE = (1200, 1200)
    FULL_SIZE = (2400, 2400)
    QUALITY = 85
    WEBP_QUALITY = 80
    
    @staticmethod
    def process_image(image_file, filename):
        """Process image: compress, resize, convert to WebP"""
        try:
            img = Image.open(image_file)
            
            # Convert RGBA to RGB if needed
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Auto-rotate based on EXIF
            try:
                from PIL import ImageOps
                img = ImageOps.exif_transpose(img)
            except:
                pass
            
            base_name = os.path.splitext(filename)[0]
            results = {}
            
            # Generate thumbnail
            thumb = img.copy()
            thumb.thumbnail(ImageProcessor.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
            thumb_io = BytesIO()
            thumb.save(thumb_io, format='WEBP', quality=ImageProcessor.WEBP_QUALITY, optimize=True)
            results['thumbnail'] = ContentFile(thumb_io.getvalue(), name=f"{base_name}_thumb.webp")
            
            # Generate medium size
            medium = img.copy()
            medium.thumbnail(ImageProcessor.MEDIUM_SIZE, Image.Resampling.LANCZOS)
            medium_io = BytesIO()
            medium.save(medium_io, format='WEBP', quality=ImageProcessor.WEBP_QUALITY, optimize=True)
            results['medium'] = ContentFile(medium_io.getvalue(), name=f"{base_name}_medium.webp")
            
            # Generate full size (compressed)
            full = img.copy()
            full.thumbnail(ImageProcessor.FULL_SIZE, Image.Resampling.LANCZOS)
            full_io = BytesIO()
            full.save(full_io, format='WEBP', quality=ImageProcessor.QUALITY, optimize=True)
            results['full'] = ContentFile(full_io.getvalue(), name=f"{base_name}_full.webp")
            
            return results
            
        except Exception as e:
            raise Exception(f"Image processing failed: {str(e)}")
    
    @staticmethod
    def get_image_dimensions(image_file):
        """Get image dimensions without loading full image"""
        try:
            img = Image.open(image_file)
            return img.size
        except:
            return None
