from django.core.management.base import BaseCommand
from albums.models import Testimonial, PortfolioImage


class Command(BaseCommand):
    help = 'Clean up invalid Unsplash URLs from database'

    def handle(self, *args, **options):
        # Clean up testimonials with invalid avatar URLs
        testimonials_updated = 0
        for testimonial in Testimonial.objects.all():
            if testimonial.avatar and 'unsplash.com' in str(testimonial.avatar):
                testimonial.avatar = None
                testimonial.save()
                testimonials_updated += 1
                self.stdout.write(f'Cleaned testimonial: {testimonial.name}')

        # Clean up portfolio images with invalid URLs
        portfolio_images_deleted = 0
        for portfolio_image in PortfolioImage.objects.all():
            if portfolio_image.image and 'unsplash.com' in str(portfolio_image.image):
                portfolio_image.delete()
                portfolio_images_deleted += 1
                self.stdout.write(f'Deleted invalid portfolio image')

        self.stdout.write(
            self.style.SUCCESS(
                f'Cleanup completed: {testimonials_updated} testimonials updated, '
                f'{portfolio_images_deleted} portfolio images deleted'
            )
        )