import os
from django.core.management.base import BaseCommand
from django.conf import settings
from albums.models import Photo
from albums.image_processor import ImageProcessor
from urllib.parse import urlparse

class Command(BaseCommand):
    help = 'Optimize existing images by generating thumbnails and WebP versions'

    def handle(self, *args, **options):
        photos = Photo.objects.filter(thumbnail_url='')
        total = photos.count()
        
        self.stdout.write(f'Found {total} photos to optimize...')
        
        processed = 0
        errors = 0
        
        for photo in photos:
            try:
                parsed = urlparse(photo.url)
                relative_path = parsed.path.lstrip('/')
                if relative_path.startswith('media/'):
                    relative_path = relative_path[6:]
                
                file_path = os.path.join(settings.MEDIA_ROOT, relative_path)
                
                if not os.path.exists(file_path):
                    self.stdout.write(self.style.WARNING(f'File not found: {file_path}'))
                    errors += 1
                    continue
                
                directory = os.path.dirname(file_path)
                filename = os.path.basename(file_path)
                base_name = os.path.splitext(filename)[0]
                
                with open(file_path, 'rb') as f:
                    processed_images = ImageProcessor.process_image(f, base_name)
                
                thumb_path = os.path.join(directory, processed_images['thumbnail'].name)
                medium_path = os.path.join(directory, processed_images['medium'].name)
                full_path = os.path.join(directory, processed_images['full'].name)
                
                with open(thumb_path, 'wb') as dest:
                    dest.write(processed_images['thumbnail'].read())
                with open(medium_path, 'wb') as dest:
                    dest.write(processed_images['medium'].read())
                with open(full_path, 'wb') as dest:
                    dest.write(processed_images['full'].read())
                
                base_url = photo.url.rsplit('/', 1)[0] + '/'
                photo.thumbnail_url = base_url + processed_images['thumbnail'].name
                photo.medium_url = base_url + processed_images['medium'].name
                photo.url = base_url + processed_images['full'].name
                photo.save()
                
                processed += 1
                if processed % 10 == 0:
                    self.stdout.write(f'Processed {processed}/{total}...')
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error processing photo {photo.id}: {str(e)}'))
                errors += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'Optimization complete! Processed: {processed}, Errors: {errors}'
        ))
