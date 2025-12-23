import os
from django.core.management.base import BaseCommand
from django.core.files import File
from albums.models import PortfolioImage, PortfolioCategory, ServiceGalleryImage, Service


class Command(BaseCommand):
    help = 'Bulk upload images from a directory'

    def add_arguments(self, parser):
        parser.add_argument('directory', type=str, help='Directory containing images')
        parser.add_argument('--type', choices=['portfolio', 'service'], required=True, help='Type of images to upload')
        parser.add_argument('--category', type=str, help='Portfolio category name (required for portfolio type)')
        parser.add_argument('--service', type=str, help='Service title (required for service type)')

    def handle(self, *args, **options):
        directory = options['directory']
        upload_type = options['type']
        
        if not os.path.exists(directory):
            self.stdout.write(self.style.ERROR(f'Directory {directory} does not exist'))
            return

        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        image_files = [f for f in os.listdir(directory) 
                      if os.path.splitext(f.lower())[1] in image_extensions]

        if not image_files:
            self.stdout.write(self.style.WARNING('No image files found in directory'))
            return

        if upload_type == 'portfolio':
            category_name = options.get('category')
            if not category_name:
                self.stdout.write(self.style.ERROR('--category is required for portfolio uploads'))
                return
            
            try:
                category = PortfolioCategory.objects.get(name=category_name)
            except PortfolioCategory.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Portfolio category "{category_name}" not found'))
                return

            uploaded_count = 0
            for idx, filename in enumerate(sorted(image_files)):
                file_path = os.path.join(directory, filename)
                with open(file_path, 'rb') as f:
                    django_file = File(f)
                    PortfolioImage.objects.create(
                        image=django_file,
                        category=category,
                        order=idx
                    )
                    uploaded_count += 1
                    self.stdout.write(f'Uploaded: {filename}')

            self.stdout.write(
                self.style.SUCCESS(f'Successfully uploaded {uploaded_count} images to portfolio category "{category_name}"')
            )

        elif upload_type == 'service':
            service_title = options.get('service')
            if not service_title:
                self.stdout.write(self.style.ERROR('--service is required for service uploads'))
                return
            
            try:
                service = Service.objects.get(title=service_title)
            except Service.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Service "{service_title}" not found'))
                return

            uploaded_count = 0
            for idx, filename in enumerate(sorted(image_files)):
                file_path = os.path.join(directory, filename)
                with open(file_path, 'rb') as f:
                    django_file = File(f)
                    ServiceGalleryImage.objects.create(
                        service=service,
                        image=django_file,
                        order=idx
                    )
                    uploaded_count += 1
                    self.stdout.write(f'Uploaded: {filename}')

            self.stdout.write(
                self.style.SUCCESS(f'Successfully uploaded {uploaded_count} images to service "{service_title}"')
            )