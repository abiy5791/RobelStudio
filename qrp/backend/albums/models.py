from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User


class Album(models.Model):
    CATEGORY_CHOICES = [
        ('weddings', 'Weddings & Related Events'),
        ('family', 'Family & Life Milestones'),
        ('celebrations', 'Celebrations & Parties'),
        ('travel', 'Travel & Adventures'),
        ('special', 'Special Events & Occasions'),
        ('personal', 'Personal & Creative Albums'),
    ]
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='albums')
    names = models.CharField(max_length=200, db_index=True)
    date = models.DateField(db_index=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='weddings', db_index=True)
    slug = models.SlugField(unique=True, max_length=255, db_index=True)
    allow_downloads = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.names)
            candidate = f"{base}-{self.date}"
            self.slug = candidate
            # ensure uniqueness
            i = 1
            while Album.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{candidate}-{i}"
                i += 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.slug


class Photo(models.Model):
    album = models.ForeignKey(Album, related_name='photos', on_delete=models.CASCADE)
    url = models.URLField()  # Full size
    thumbnail_url = models.URLField(blank=True, default='')  # Thumbnail
    medium_url = models.URLField(blank=True, default='')  # Medium size
    order = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['order', 'id']
        indexes = [
            models.Index(fields=['album', 'order']),
            models.Index(fields=['album', '-likes_count']),
        ]
    
    @property
    def actual_likes_count(self):
        return self.likes.count()


class PhotoLike(models.Model):
    photo = models.ForeignKey(Photo, related_name='likes', on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['photo', 'ip_address']
        indexes = [
            models.Index(fields=['photo', 'ip_address']),
        ]


class GuestMessage(models.Model):
    album = models.ForeignKey(Album, related_name='messages', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class StudioContent(models.Model):
    hero_title = models.CharField(max_length=200)
    hero_subtitle = models.TextField()
    about_title = models.CharField(max_length=200, default='About Us')
    about_text = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Studio Content'
        verbose_name_plural = 'Studio Content'

    def __str__(self):
        return f"Studio Content - {self.hero_title[:50]}"


class StudioStat(models.Model):
    content = models.ForeignKey(StudioContent, related_name='stats', on_delete=models.CASCADE)
    label = models.CharField(max_length=50)
    value = models.CharField(max_length=20)
    icon = models.CharField(max_length=50, default='FiUsers')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.label}: {self.value}"


class Service(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='FiCamera', help_text='Icon name (e.g., FiCamera, FiUsers)')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.title


class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    quote = models.TextField()
    avatar = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.name} - {self.role}"


class ServiceGalleryImage(models.Model):
    service = models.ForeignKey(Service, related_name='gallery_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='services/%Y/%m/')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.service.title} - Image {self.order}"


class PortfolioCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Portfolio Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class PortfolioImage(models.Model):
    image = models.ImageField(upload_to='portfolio/%Y/%m/')
    category = models.ForeignKey(PortfolioCategory, on_delete=models.CASCADE, related_name='images')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.category.name} - {self.order}"


class MediaItem(models.Model):
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]
    
    title = models.CharField(max_length=100, blank=True)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default='image')
    file = models.FileField(upload_to='hero_media/%Y/%m/')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.media_type.title()} - {self.title or self.order}"
