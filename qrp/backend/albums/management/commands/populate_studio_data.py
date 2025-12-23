from django.core.management.base import BaseCommand
from albums.models import StudioContent, Service, Testimonial, PortfolioImage, PortfolioCategory, ServiceGalleryImage


class Command(BaseCommand):
    help = 'Populate initial studio data'

    def handle(self, *args, **options):
        # Create Studio Content
        if not StudioContent.objects.exists():
            StudioContent.objects.create(
                hero_title="Capturing Life's Beautiful Moments",
                hero_subtitle="Professional photography services in Addis Ababa. Creating timeless memories with artistic vision and technical excellence.",
                about_title="Crafting stories through the lens",
                about_text="Founded in 2018 in Addis Ababa, we're passionate photographers dedicated to capturing life's most precious moments with artistic vision and professional excellence.",
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS('Studio content created'))

        # Create Portfolio Categories
        categories_data = [
            {'name': 'Weddings', 'slug': 'weddings', 'order': 0},
            {'name': 'Portraits', 'slug': 'portraits', 'order': 1},
            {'name': 'Lifestyle', 'slug': 'lifestyle', 'order': 2},
        ]
        
        for cat_data in categories_data:
            PortfolioCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
        self.stdout.write(self.style.SUCCESS(f'{len(categories_data)} portfolio categories created'))

        # Create Services
        services_data = [
            {
                'title': 'Pre-Wedding',
                'description': 'Elegant, cinematic storytelling of your love journey before the aisle, crafted with romantic direction.',
                'icon': 'FiCamera',
                'order': 0
            },
            {
                'title': 'Wedding Day',
                'description': 'Complete wedding coverage with a calm, documentary approach that honors every vow, detail, and embrace.',
                'icon': 'FiUsers',
                'order': 1
            },
            {
                'title': 'Melese',
                'description': 'Cultural and family celebrations photographed with respect, warmth, and refined lighting.',
                'icon': 'FiSun',
                'order': 2
            },
            {
                'title': 'Kurban',
                'description': 'Meaningful ceremonial moments captured with sensitivity and premium post-production.',
                'icon': 'FiFilm',
                'order': 3
            },
            {
                'title': 'Maternity & Family',
                'description': 'Tender portraiture that preserves the glow of motherhood and the bonds of family.',
                'icon': 'FiAperture',
                'order': 4
            },
            {
                'title': 'Kids & Lifestyle',
                'description': 'Playful, personality-filled sessions designed to feel effortless while staying beautifully styled.',
                'icon': 'FiBriefcase',
                'order': 5
            },
        ]

        for service_data in services_data:
            Service.objects.get_or_create(
                title=service_data['title'],
                defaults=service_data
            )
        self.stdout.write(self.style.SUCCESS(f'{len(services_data)} services created'))

        # Create Testimonials
        testimonials_data = [
            {
                'name': 'Daniel & Meron Bekele',
                'role': 'Luxury Wedding Coverage',
                'quote': 'Robel Studio captured our wedding with a level of storytelling we did not think was possible. Every frame feels intentional, emotional, and timeless. Looking through our gallery feels like reliving the day exactly as it happened.',
                # Note: Avatar should be uploaded through admin interface
                'order': 0
            },
            {
                'name': 'Hanna Girma',
                'role': 'Portrait & Branding Session',
                'quote': 'The experience was effortless and empowering. Robel Studio guided me with such clarity and confidence, and the final portraits elevated my personal brand beyond my expectations. Absolutely world-class work.',
                # Note: Avatar should be uploaded through admin interface
                'order': 1
            },
            {
                'name': 'Samuel & Liya Worku',
                'role': 'Engagement & Wedding Photography',
                'quote': 'What stood out most was their calm presence and attention to emotion. Nothing felt forced, yet every meaningful moment was preserved beautifully. Our friends keep asking who photographed our wedding.',
                # Note: Avatar should be uploaded through admin interface
                'order': 2
            },
            {
                'name': 'Dr. Ruth Mekonnen',
                'role': 'Family & Lifestyle Photography',
                'quote': 'Robel Studio has an incredible gift for making people feel at ease. Our family session was joyful and relaxed, and the images reflect genuine connection and warmth. These photos will be cherished for generations.',
                # Note: Avatar should be uploaded through admin interface
                'order': 3
            },
        ]

        for testimonial_data in testimonials_data:
            Testimonial.objects.get_or_create(
                name=testimonial_data['name'],
                defaults=testimonial_data
            )
        self.stdout.write(self.style.SUCCESS(f'{len(testimonials_data)} testimonials created'))

        self.stdout.write(self.style.SUCCESS('Note: Portfolio images and service gallery images should be uploaded through the admin interface'))

        self.stdout.write(self.style.SUCCESS('Studio data populated successfully!'))
