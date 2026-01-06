from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AlbumCreateView, AlbumDetailView, GuestMessageCreateView,
    UploadImagesView, DownloadPhotoView, DownloadAlbumZipView,
    PhotoLikeView, MyAlbumsView, StudioDataView, BulkUploadPortfolioImagesView,
    BulkUploadServiceImagesView, StudioContentManageView, StudioStatManageView,
    StudioStatDetailManageView, ServiceManageView, ServiceDetailManageView,
    TestimonialManageView, TestimonialDetailManageView,
    PortfolioCategoryManageView, PortfolioCategoryDetailManageView,
    PortfolioImageManageView, PortfolioImageDetailManageView,
    ServiceGalleryImageManageView, ServiceGalleryImageDetailManageView,
    MediaItemManageView, MediaItemDetailManageView,
    VideoCategoryManageView, VideoCategoryDetailManageView, VideoManageView,
    VideoDetailManageView, BulkUploadVideosView,
    StudioContactManageView, SocialLinkManageView, SocialLinkDetailManageView,
    ContactMessageCreateView, ContactMessageManageView, ContactMessageDetailManageView,
)
from .auth_views import RegisterView, LoginView, UserProfileView

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Album endpoints
    path('albums/', AlbumCreateView.as_view(), name='album-list-create'),
    path('albums/my/', MyAlbumsView.as_view(), name='my-albums'),
    path('albums/<slug:slug>/', AlbumDetailView.as_view(), name='album-detail'),
    path('albums/<slug:slug>/messages/', GuestMessageCreateView.as_view(), name='guest-message-create'),
    path('albums/<slug:slug>/download/<int:photo_index>/', DownloadPhotoView.as_view(), name='download-photo'),
    path('albums/<slug:slug>/download-zip/', DownloadAlbumZipView.as_view(), name='download-album-zip'),
    path('albums/<slug:slug>/photos/<int:photo_id>/like/', PhotoLikeView.as_view(), name='photo-like'),
    
    # Upload endpoints
    path('uploads/images/', UploadImagesView.as_view(), name='upload-images'),
    path('uploads/portfolio/', BulkUploadPortfolioImagesView.as_view(), name='bulk-upload-portfolio'),
    path('uploads/service/', BulkUploadServiceImagesView.as_view(), name='bulk-upload-service'),
    
    # Studio landing page data
    path('studio/', StudioDataView.as_view(), name='studio-data'),
    
    # Studio management endpoints
    path('manage/content/', StudioContentManageView.as_view(), name='manage-content'),
    path('manage/contact/', StudioContactManageView.as_view(), name='manage-contact'),
    path('manage/stats/', StudioStatManageView.as_view(), name='manage-stats'),
    path('manage/stats/<int:pk>/', StudioStatDetailManageView.as_view(), name='manage-stat-detail'),
    path('manage/social-links/', SocialLinkManageView.as_view(), name='manage-social-links'),
    path('manage/social-links/<int:pk>/', SocialLinkDetailManageView.as_view(), name='manage-social-link-detail'),
    path('manage/services/', ServiceManageView.as_view(), name='manage-services'),
    path('manage/services/<int:pk>/', ServiceDetailManageView.as_view(), name='manage-service-detail'),
    path('manage/testimonials/', TestimonialManageView.as_view(), name='manage-testimonials'),
    path('manage/testimonials/<int:pk>/', TestimonialDetailManageView.as_view(), name='manage-testimonial-detail'),
    path('manage/categories/', PortfolioCategoryManageView.as_view(), name='manage-categories'),
    path('manage/categories/<int:pk>/', PortfolioCategoryDetailManageView.as_view(), name='manage-category-detail'),
    path('manage/portfolio/', PortfolioImageManageView.as_view(), name='manage-portfolio'),
    path('manage/portfolio/<int:pk>/', PortfolioImageDetailManageView.as_view(), name='manage-portfolio-detail'),
    path('manage/service-gallery/', ServiceGalleryImageManageView.as_view(), name='manage-service-gallery'),
    path('manage/service-gallery/<int:pk>/', ServiceGalleryImageDetailManageView.as_view(), name='manage-service-gallery-detail'),
    path('manage/media-items/', MediaItemManageView.as_view(), name='manage-media-items'),
    path('manage/media-items/<int:pk>/', MediaItemDetailManageView.as_view(), name='manage-media-items-detail'),
    path('manage/video-categories/', VideoCategoryManageView.as_view(), name='manage-video-categories'),
    path('manage/video-categories/<int:pk>/', VideoCategoryDetailManageView.as_view(), name='manage-video-category-detail'),
    path('manage/videos/', VideoManageView.as_view(), name='manage-videos'),
    path('manage/videos/<int:pk>/', VideoDetailManageView.as_view(), name='manage-video-detail'),
    path('uploads/videos/', BulkUploadVideosView.as_view(), name='bulk-upload-videos'),
    
    # Contact message endpoints
    path('contact/', ContactMessageCreateView.as_view(), name='contact-message-create'),
    path('manage/messages/', ContactMessageManageView.as_view(), name='manage-contact-messages'),
    path('manage/messages/<int:pk>/', ContactMessageDetailManageView.as_view(), name='manage-contact-message-detail'),
]
