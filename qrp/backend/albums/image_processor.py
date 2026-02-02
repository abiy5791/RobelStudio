import os
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

class ImageProcessor:
    """Optimized image processing for high-quality photos"""
    
    THUMBNAIL_SIZE = (400, 400)
    MEDIUM_SIZE = (1200, 1200)
    FULL_SIZE = (2400, 2400)
    QUALITY = 90
    WEBP_QUALITY = 85

    @staticmethod
    def _open_and_normalize(image_file):
        """Open an uploaded image and normalize orientation/color mode."""
        try:
            try:
                image_file.seek(0)
            except Exception:
                pass

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
            except Exception:
                pass

            return img
        except Exception as e:
            raise Exception(f"Image open/normalize failed: {str(e)}")

    @staticmethod
    def process_full_image(image_file, filename, *, max_size=None, quality=None, suffix='full'):
        """Process image and return a single WebP ContentFile (default: full size).

        This is intended for non-album uploads where we want only one optimized image.
        """
        try:
            img = ImageProcessor._open_and_normalize(image_file)

            target_size = max_size or ImageProcessor.FULL_SIZE
            target_quality = ImageProcessor.QUALITY if quality is None else quality

            base_name = os.path.splitext(filename)[0]
            out = img.copy()
            out.thumbnail(target_size, Image.Resampling.LANCZOS)
            out_io = BytesIO()
            out.save(out_io, format='WEBP', quality=target_quality, method=4)
            return ContentFile(out_io.getvalue(), name=f"{base_name}_{suffix}.webp")
        except Exception as e:
            raise Exception(f"Image processing failed: {str(e)}")
    
    @staticmethod
    def process_image(image_file, filename):
        """Process image: compress, resize, convert to WebP"""
        try:
            img = ImageProcessor._open_and_normalize(image_file)
            
            base_name = os.path.splitext(filename)[0]
            results = {}
            
            # Generate all sizes in parallel using threads
            from concurrent.futures import ThreadPoolExecutor
            
            def create_thumbnail():
                thumb = img.copy()
                thumb.thumbnail(ImageProcessor.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
                thumb_io = BytesIO()
                thumb.save(thumb_io, format='WEBP', quality=ImageProcessor.WEBP_QUALITY, method=4)
                return ContentFile(thumb_io.getvalue(), name=f"{base_name}_thumb.webp")
            
            def create_medium():
                medium = img.copy()
                medium.thumbnail(ImageProcessor.MEDIUM_SIZE, Image.Resampling.LANCZOS)
                medium_io = BytesIO()
                medium.save(medium_io, format='WEBP', quality=ImageProcessor.WEBP_QUALITY, method=4)
                return ContentFile(medium_io.getvalue(), name=f"{base_name}_medium.webp")
            
            def create_full():
                full = img.copy()
                full.thumbnail(ImageProcessor.FULL_SIZE, Image.Resampling.LANCZOS)
                full_io = BytesIO()
                full.save(full_io, format='WEBP', quality=ImageProcessor.QUALITY, method=4)
                return ContentFile(full_io.getvalue(), name=f"{base_name}_full.webp")
            
            with ThreadPoolExecutor(max_workers=3) as executor:
                thumb_future = executor.submit(create_thumbnail)
                medium_future = executor.submit(create_medium)
                full_future = executor.submit(create_full)
                
                results['thumbnail'] = thumb_future.result()
                results['medium'] = medium_future.result()
                results['full'] = full_future.result()
            
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
