import os
import time
import zipfile
from django.conf import settings
from django.http import HttpResponse, Http404
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.db.models import Prefetch, Count, Max
from django.db import models
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from urllib.parse import urlparse

from .models import Album, GuestMessage, Photo, PhotoLike, StudioContent, StudioStat, Service, Testimonial, PortfolioImage, ServiceGalleryImage, PortfolioCategory, MediaItem
from .serializers import (
    AlbumSerializer, GuestMessageSerializer, AlbumListSerializer, 
    StudioContentSerializer, StudioStatSerializer, ServiceSerializer, TestimonialSerializer, 
    PortfolioImageSerializer, PortfolioCategorySerializer, ServiceGalleryImageSerializer,
    StudioContentUpdateSerializer, StudioStatCreateUpdateSerializer, ServiceCreateUpdateSerializer,
    TestimonialCreateUpdateSerializer, PortfolioCategoryCreateUpdateSerializer,
    MediaItemSerializer, MediaItemCreateUpdateSerializer
)
from .permissions import IsOwnerOrReadOnly, IsAuthenticatedOrReadOnly
from .image_processor import ImageProcessor


class AlbumPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AlbumCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = AlbumPagination

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return AlbumListSerializer
        return AlbumSerializer

    def get_queryset(self):
        return Album.objects.select_related('owner').prefetch_related('photos').order_by('-created_at')
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class AlbumDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AlbumSerializer
    lookup_field = 'slug'
    permission_classes = [IsOwnerOrReadOnly]

    def get_queryset(self):
        return Album.objects.select_related('owner').prefetch_related(
            'photos', 'messages'
        )
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_update(self, serializer):
        serializer.save(owner=serializer.instance.owner)


class MyAlbumsView(generics.ListAPIView):
    """List all albums owned by the current user"""
    serializer_class = AlbumListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = AlbumPagination
    
    def get_queryset(self):
        return Album.objects.filter(owner=self.request.user).select_related('owner').prefetch_related('photos').order_by('-created_at')
    
    def get_serializer_context(self):
        return {'request': self.request}


class GuestMessageCreateView(generics.CreateAPIView):
    serializer_class = GuestMessageSerializer

    def perform_create(self, serializer):
        album = get_object_or_404(Album, slug=self.kwargs['slug'])
        serializer.save(album=album)


class UploadImagesView(APIView):
    """Optimized image upload with compression and multiple sizes"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        files = request.FILES.getlist('files')
        if not files:
            return Response({'detail': 'No files provided'}, status=status.HTTP_400_BAD_REQUEST)

        ts = str(int(time.time() * 1000))
        subdir = os.path.join('albums', ts)
        target_dir = os.path.join(settings.MEDIA_ROOT, subdir)
        os.makedirs(target_dir, exist_ok=True)

        results = []
        for idx, f in enumerate(files):
            try:
                safe_name = f"{idx}-{os.path.splitext(f.name)[0]}"
                
                # Process image (compress, resize, convert to WebP)
                processed = ImageProcessor.process_image(f, safe_name)
                
                # Save all versions
                thumb_path = os.path.join(target_dir, processed['thumbnail'].name)
                medium_path = os.path.join(target_dir, processed['medium'].name)
                full_path = os.path.join(target_dir, processed['full'].name)
                
                with open(thumb_path, 'wb') as dest:
                    dest.write(processed['thumbnail'].read())
                with open(medium_path, 'wb') as dest:
                    dest.write(processed['medium'].read())
                with open(full_path, 'wb') as dest:
                    dest.write(processed['full'].read())
                
                # Build URLs
                base_url = settings.MEDIA_URL + subdir.replace('\\', '/') + '/'
                results.append({
                    'url': request.build_absolute_uri(base_url + processed['full'].name),
                    'thumbnail_url': request.build_absolute_uri(base_url + processed['thumbnail'].name),
                    'medium_url': request.build_absolute_uri(base_url + processed['medium'].name),
                })
            except Exception as e:
                return Response({'detail': f'Failed to process image {idx}: {str(e)}'}, 
                              status=status.HTTP_400_BAD_REQUEST)

        return Response({'images': results}, status=status.HTTP_201_CREATED)


class DownloadPhotoView(APIView):
    def get(self, request, slug, photo_index):
        album = get_object_or_404(Album, slug=slug)
        
        # Check if downloads are allowed for this album
        if not album.allow_downloads:
            return Response(
                {'detail': 'Downloads are not allowed for this album'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        photos = list(album.photos.all())
        if photo_index >= len(photos):
            raise Http404("Photo not found")
        
        photo = photos[photo_index]
        parsed_url = urlparse(photo.url)
        # Remove both /media/ and leading slash
        relative_path = parsed_url.path.lstrip('/')
        if relative_path.startswith('media/'):
            relative_path = relative_path[6:]  # Remove 'media/'
        
        file_path = os.path.join(settings.MEDIA_ROOT, relative_path)
        
        if not os.path.exists(file_path):
            raise Http404("File not found")
        
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/octet-stream')
            filename = os.path.basename(file_path)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response


class DownloadAlbumZipView(APIView):
    def get(self, request, slug):
        album = get_object_or_404(Album, slug=slug)
        
        # Check if downloads are allowed for this album
        if not album.allow_downloads:
            return Response(
                {'detail': 'Downloads are not allowed for this album'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        response = HttpResponse(content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{album.names}_photos.zip"'
        
        with zipfile.ZipFile(response, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for photo in album.photos.all():
                parsed_url = urlparse(photo.url)
                # Remove both /media/ and leading slash
                relative_path = parsed_url.path.lstrip('/')
                if relative_path.startswith('media/'):
                    relative_path = relative_path[6:]  # Remove 'media/'
                
                file_path = os.path.join(settings.MEDIA_ROOT, relative_path)
                
                if os.path.exists(file_path):
                    filename = os.path.basename(file_path)
                    zip_file.write(file_path, filename)
        
        return response


class PhotoLikeView(APIView):
    def post(self, request, slug, photo_id):
        from django.db import transaction
        
        album = get_object_or_404(Album, slug=slug)
        photo = get_object_or_404(Photo, id=photo_id, album=album)
        
        ip_address = self.get_client_ip(request)
        
        with transaction.atomic():
            like, created = PhotoLike.objects.get_or_create(
                photo=photo,
                ip_address=ip_address
            )
            
            if created:
                # Get actual count from database
                likes_count = photo.likes.count()
                return Response({'liked': True, 'likes_count': likes_count})
            else:
                like.delete()
                # Get actual count from database after deletion
                likes_count = photo.likes.count()
                return Response({'liked': False, 'likes_count': likes_count})
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@method_decorator(cache_page(60), name='get')  # Cache for 1 minute
class StudioDataView(APIView):
    """Public API for studio landing page data"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # Get active studio content
            content = StudioContent.objects.filter(is_active=True).first()
            
            # Get active services, testimonials, and portfolio images
            services = Service.objects.filter(is_active=True).order_by('order', 'created_at')
            testimonials = Testimonial.objects.filter(is_active=True).order_by('order', 'created_at')
            portfolio = PortfolioImage.objects.filter(is_active=True).order_by('order', 'created_at')
            
            # Get portfolio categories for filtering
            categories = PortfolioCategory.objects.filter(is_active=True).order_by('order', 'name')
            
            # Get media items for hero section
            media_items = MediaItem.objects.filter(is_active=True).order_by('order', 'created_at')
            
            return Response({
                'content': StudioContentSerializer(content).data if content else None,
                'services': ServiceSerializer(services, many=True, context={'request': request}).data,
                'testimonials': TestimonialSerializer(testimonials, many=True, context={'request': request}).data,
                'portfolio': PortfolioImageSerializer(portfolio, many=True, context={'request': request}).data,
                'categories': PortfolioCategorySerializer(categories, many=True).data,
                'media_items': MediaItemSerializer(media_items, many=True, context={'request': request}).data
            })
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch studio data'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BulkUploadPortfolioImagesView(APIView):
    """Bulk upload multiple images to a portfolio category"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        category_id = request.data.get('category_id')
        images = request.FILES.getlist('images')
        
        if not category_id:
            return Response({'error': 'category_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not images:
            return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            category = PortfolioCategory.objects.get(id=category_id)
        except PortfolioCategory.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get the highest order number for this category
        last_order = PortfolioImage.objects.filter(category=category).aggregate(
            max_order=models.Max('order')
        )['max_order'] or 0
        
        created_images = []
        for idx, image in enumerate(images):
            portfolio_image = PortfolioImage.objects.create(
                image=image,
                category=category,
                order=last_order + idx + 1
            )
            created_images.append(portfolio_image)
        
        serializer = PortfolioImageSerializer(created_images, many=True, context={'request': request})
        return Response({
            'message': f'Successfully uploaded {len(created_images)} images',
            'images': serializer.data
        }, status=status.HTTP_201_CREATED)


class BulkUploadServiceImagesView(APIView):
    """Bulk upload multiple images to a service gallery"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        service_id = request.data.get('service_id')
        images = request.FILES.getlist('images')
        
        if not service_id:
            return Response({'error': 'service_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not images:
            return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            service = Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get the highest order number for this service
        last_order = ServiceGalleryImage.objects.filter(service=service).aggregate(
            max_order=models.Max('order')
        )['max_order'] or 0
        
        created_images = []
        for idx, image in enumerate(images):
            gallery_image = ServiceGalleryImage.objects.create(
                service=service,
                image=image,
                order=last_order + idx + 1
            )
            created_images.append(gallery_image)
        
        serializer = ServiceGalleryImageSerializer(created_images, many=True, context={'request': request})
        return Response({
            'message': f'Successfully uploaded {len(created_images)} images',
            'images': serializer.data
        }, status=status.HTTP_201_CREATED)


# Studio Management CRUD Views
class StudioContentManageView(generics.RetrieveUpdateAPIView):
    """Manage studio content (hero, about sections)"""
    serializer_class = StudioContentUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        obj, created = StudioContent.objects.get_or_create(defaults={'is_active': True})
        if created:
            # Create default stats
            StudioStat.objects.bulk_create([
                StudioStat(content=obj, label='Happy Clients', value='1K+', icon='FiUsers', order=1),
                StudioStat(content=obj, label='Years Experience', value='6+', icon='FiCamera', order=2),
                StudioStat(content=obj, label='Awards Won', value='50+', icon='FiAward', order=3),
                StudioStat(content=obj, label='Moments Captured', value='1000+', icon='FiHeart', order=4),
            ])
        return obj
    
    def perform_update(self, serializer):
        serializer.save()
        cache.delete('studio_data')  # Clear cache on update


class StudioStatManageView(generics.ListCreateAPIView):
    """List and create studio stats"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StudioStatCreateUpdateSerializer
        return StudioStatSerializer
    
    def get_queryset(self):
        content = StudioContent.objects.filter(is_active=True).first()
        if content:
            return content.stats.all().order_by('order', 'id')
        return StudioStat.objects.none()
    
    def perform_create(self, serializer):
        content, _ = StudioContent.objects.get_or_create(defaults={'is_active': True})
        serializer.save(content=content)
        cache.delete('studio_data')


class StudioStatDetailManageView(generics.RetrieveUpdateDestroyAPIView):
    """Manage individual studio stat"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StudioStatCreateUpdateSerializer
        return StudioStatSerializer
    
    def get_queryset(self):
        return StudioStat.objects.all()
    
    def perform_update(self, serializer):
        serializer.save()
        cache.delete('studio_data')
    
    def perform_destroy(self, instance):
        instance.delete()
        cache.delete('studio_data')
        cache.clear()


class ServiceManageView(generics.ListCreateAPIView):
    """List and create services"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ServiceCreateUpdateSerializer
        return ServiceSerializer
    
    def get_queryset(self):
        return Service.objects.all().order_by('order', 'created_at')
    
    def get_serializer_context(self):
        return {'request': self.request}


class ServiceDetailManageView(generics.RetrieveUpdateDestroyAPIView):
    """Manage individual service"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ServiceCreateUpdateSerializer
        return ServiceSerializer
    
    def get_queryset(self):
        return Service.objects.all()
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_update(self, serializer):
        serializer.save()
        cache.delete('studio_data')
    
    def perform_destroy(self, instance):
        instance.delete()
        cache.delete('studio_data')


class TestimonialManageView(generics.ListCreateAPIView):
    """List and create testimonials"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TestimonialCreateUpdateSerializer
        return TestimonialSerializer
    
    def get_queryset(self):
        return Testimonial.objects.all().order_by('order', 'created_at')
    
    def get_serializer_context(self):
        return {'request': self.request}


class TestimonialDetailManageView(generics.RetrieveUpdateDestroyAPIView):
    """Manage individual testimonial"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TestimonialCreateUpdateSerializer
        return TestimonialSerializer
    
    def get_queryset(self):
        return Testimonial.objects.all()
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_destroy(self, instance):
        instance.delete()


class PortfolioCategoryManageView(generics.ListCreateAPIView):
    """List and create portfolio categories"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PortfolioCategoryCreateUpdateSerializer
        return PortfolioCategorySerializer
    
    def get_queryset(self):
        return PortfolioCategory.objects.all().order_by('order', 'name')


class PortfolioCategoryDetailManageView(generics.RetrieveUpdateDestroyAPIView):
    """Manage individual portfolio category"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PortfolioCategoryCreateUpdateSerializer
        return PortfolioCategorySerializer
    
    def get_queryset(self):
        return PortfolioCategory.objects.all()
    
    def perform_destroy(self, instance):
        instance.delete()


class PortfolioImageManageView(generics.ListAPIView):
    """List portfolio images by category"""
    serializer_class = PortfolioImageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        category_id = self.request.query_params.get('category_id')
        queryset = PortfolioImage.objects.all()
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset.order_by('order', 'created_at')
    
    def get_serializer_context(self):
        return {'request': self.request}


class PortfolioImageDetailManageView(generics.DestroyAPIView):
    """Delete portfolio image"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PortfolioImage.objects.all()
    
    def perform_destroy(self, instance):
        instance.delete()


class ServiceGalleryImageManageView(generics.ListAPIView):
    """List service gallery images"""
    serializer_class = ServiceGalleryImageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        service_id = self.request.query_params.get('service_id')
        queryset = ServiceGalleryImage.objects.all()
        if service_id:
            queryset = queryset.filter(service_id=service_id)
        return queryset.order_by('order', 'created_at')
    
    def get_serializer_context(self):
        return {'request': self.request}


class ServiceGalleryImageDetailManageView(generics.DestroyAPIView):
    """Delete service gallery image"""
    permission_classes = [IsAuthenticated]
    queryset = ServiceGalleryImage.objects.all()


class MediaItemManageView(generics.ListCreateAPIView):
    """List and create media items for hero section"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MediaItemCreateUpdateSerializer
        return MediaItemSerializer
    
    def get_queryset(self):
        return MediaItem.objects.all().order_by('order', 'created_at')
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_create(self, serializer):
        serializer.save()
        cache.delete('studio_data')


class MediaItemDetailManageView(generics.RetrieveUpdateDestroyAPIView):
    """Manage individual media item"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return MediaItemCreateUpdateSerializer
        return MediaItemSerializer
    
    def get_queryset(self):
        return MediaItem.objects.all()
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_update(self, serializer):
        serializer.save()
        cache.delete('studio_data')
    
    def perform_destroy(self, instance):
        instance.delete()
        cache.delete('studio_data')
