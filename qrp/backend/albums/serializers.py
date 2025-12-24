from rest_framework import serializers
from django.conf import settings
from django.db.models import Count
from .models import Album, Photo, GuestMessage, PhotoLike, StudioContent, StudioStat, Service, Testimonial, PortfolioImage, ServiceGalleryImage, PortfolioCategory, MediaItem


class GuestMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestMessage
        fields = ['name', 'message', 'created_at']
        read_only_fields = ['created_at']


class AlbumListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for album lists"""
    owner_username = serializers.CharField(
        source='owner.username', read_only=True)
    is_owner = serializers.SerializerMethodField(read_only=True)
    photo_count = serializers.SerializerMethodField(read_only=True)
    cover_photo = serializers.SerializerMethodField(read_only=True)
    url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Album
        fields = [
            'names', 'date', 'category', 'slug', 'url',
            'owner_username', 'is_owner', 'created_at',
            'photo_count', 'cover_photo'
        ]

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.owner == request.user
        return False

    def get_url(self, obj):
        # Return secure QR URL that goes to landing page with album parameter
        from django.conf import settings
        import urllib.parse

        # Validate album slug/ID before generating URL
        if not obj.slug:
            return None

        # Use landing page with album parameter for QR codes
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')

        # URL encode the slug for security
        encoded_slug = urllib.parse.quote(str(obj.slug), safe='')

        return f"{base_url}/?album={encoded_slug}"

    def get_photo_count(self, obj):
        return obj.photos.count()

    def get_cover_photo(self, obj):
        request = self.context.get('request')
        photos = obj.photos.all()[:1]
        if photos:
            first_photo = photos[0]
            return {
                'url': request.build_absolute_uri(first_photo.url) if request and not first_photo.url.startswith('http') else first_photo.url,
                'thumbnail_url': request.build_absolute_uri(first_photo.thumbnail_url) if request and first_photo.thumbnail_url and not first_photo.thumbnail_url.startswith('http') else first_photo.thumbnail_url,
            }
        return None


class AlbumSerializer(serializers.ModelSerializer):
    # Represent photos as a simple list of URLs (strings)
    photos = serializers.ListField(
        child=serializers.JSONField(), write_only=True, required=False)
    url = serializers.SerializerMethodField(read_only=True)
    photos_out = serializers.SerializerMethodField(
        source='get_photos', read_only=True)
    messages = GuestMessageSerializer(many=True, read_only=True)
    owner_username = serializers.CharField(
        source='owner.username', read_only=True)
    is_owner = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Album
        fields = [
            'names', 'date', 'description', 'category', 'slug', 'photos', 'photos_out',
            'url', 'messages', 'allow_downloads', 'owner_username', 'is_owner', 'created_at'
        ]
        read_only_fields = ['slug', 'photos_out', 'url',
                            'messages', 'owner_username', 'is_owner', 'created_at']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.owner == request.user
        return False

    def get_url(self, obj):
        # Return secure QR URL that goes to landing page with album parameter
        from django.conf import settings
        import urllib.parse

        # Validate album slug/ID before generating URL
        if not obj.slug:
            return None

        # Use landing page with album parameter for QR codes
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')

        # URL encode the slug for security
        encoded_slug = urllib.parse.quote(str(obj.slug), safe='')

        return f"{base_url}/?album={encoded_slug}"

    def get_photos_out(self, obj):
        request = self.context.get('request')
        user_ip = self.get_client_ip(request) if request else None

        # Prefetch likes to avoid N+1 queries
        photos = obj.photos.prefetch_related('likes').all()

        # Get all liked photo IDs in one query
        liked_photo_ids = set()
        if user_ip:
            liked_photo_ids = set(
                PhotoLike.objects.filter(
                    photo__album=obj,
                    ip_address=user_ip
                ).values_list('photo_id', flat=True)
            )

        photos_data = []
        for p in photos:
            photos_data.append({
                'url': request.build_absolute_uri(p.url) if request and not p.url.startswith('http') else p.url,
                'thumbnail_url': request.build_absolute_uri(p.thumbnail_url) if request and p.thumbnail_url and not p.thumbnail_url.startswith('http') else p.thumbnail_url,
                'medium_url': request.build_absolute_uri(p.medium_url) if request and p.medium_url and not p.medium_url.startswith('http') else p.medium_url,
                'likes_count': p.likes.count(),
                'id': p.id,
                'is_liked': p.id in liked_photo_ids,
                'width': p.width,
                'height': p.height,
            })
        return photos_data

    def get_client_ip(self, request):
        if not request:
            return None
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Expose photos as list of URLs under 'photos' for GET
        data['photos'] = data.pop('photos_out', [])
        return data

    def create(self, validated_data):
        photos_data = validated_data.pop('photos', [])
        album = Album.objects.create(**validated_data)

        # Handle new format with thumbnail/medium URLs
        for idx, photo_data in enumerate(photos_data):
            if isinstance(photo_data, str):
                # Old format: just URL
                Photo.objects.create(album=album, order=idx, url=photo_data)
            else:
                # New format: dict with url, thumbnail_url, medium_url
                Photo.objects.create(
                    album=album,
                    order=idx,
                    url=photo_data.get('url', photo_data),
                    thumbnail_url=photo_data.get('thumbnail_url', ''),
                    medium_url=photo_data.get('medium_url', ''),
                )
        return album

    def update(self, instance, validated_data):
        photos_data = validated_data.pop('photos', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if photos_data is not None:
            instance.photos.all().delete()
            for idx, photo_data in enumerate(photos_data):
                if isinstance(photo_data, str):
                    Photo.objects.create(
                        album=instance, order=idx, url=photo_data)
                else:
                    Photo.objects.create(
                        album=instance,
                        order=idx,
                        url=photo_data.get('url', photo_data),
                        thumbnail_url=photo_data.get('thumbnail_url', ''),
                        medium_url=photo_data.get('medium_url', ''),
                    )

        return instance


class StudioStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioStat
        fields = ['id', 'label', 'value', 'icon', 'order', 'is_active']


class StudioContentSerializer(serializers.ModelSerializer):
    stats = serializers.SerializerMethodField()

    class Meta:
        model = StudioContent
        fields = ['hero_title', 'hero_subtitle',
                  'about_title', 'about_text', 'stats']

    def get_stats(self, obj):
        stats = obj.stats.all().order_by('order', 'id')
        return StudioStatSerializer(stats, many=True).data


class ServiceGalleryImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ServiceGalleryImage
        fields = ['id', 'image', 'order']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class ServiceSerializer(serializers.ModelSerializer):
    gallery_images = serializers.SerializerMethodField()
    gallery_count = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'title', 'description', 'icon',
                  'gallery_images', 'gallery_count', 'is_active']

    def get_gallery_images(self, obj):
        request = self.context.get('request')
        images = obj.gallery_images.filter().order_by('order')
        return [request.build_absolute_uri(img.image.url) if request else img.image.url for img in images]

    def get_gallery_count(self, obj):
        return obj.gallery_images.count()


class TestimonialSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = ['id', 'name', 'role', 'quote', 'avatar', 'is_active']

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar:
            url = obj.avatar.url
            if url.startswith('http'):
                return url
            return request.build_absolute_uri(url) if request else url
        return None


class PortfolioCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioCategory
        fields = ['id', 'name', 'slug', 'is_active']


class PortfolioImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    category = serializers.CharField(source='category.slug')

    class Meta:
        model = PortfolioImage
        fields = ['id', 'url', 'category']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            url = obj.image.url
            if url.startswith('http'):
                return url
            return request.build_absolute_uri(url) if request else url
        return None


# CRUD Serializers for Studio Management
class StudioContentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioContent
        fields = ['hero_title', 'hero_subtitle', 'about_title', 'about_text']


class StudioStatCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioStat
        fields = ['label', 'value', 'icon', 'order', 'is_active']


class ServiceCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['title', 'description', 'icon']


class TestimonialCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['name', 'role', 'quote', 'avatar']


class PortfolioCategoryCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioCategory
        fields = ['name']

    def validate_name(self, value):
        # Auto-generate slug from name
        return value.strip()


class MediaItemSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaItem
        fields = ['id', 'title', 'media_type', 'url']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            url = obj.file.url
            if url.startswith('http'):
                return url
            return request.build_absolute_uri(url) if request else url
        return None


class MediaItemCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaItem
        fields = ['title', 'media_type', 'file', 'order']
