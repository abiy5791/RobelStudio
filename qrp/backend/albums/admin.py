from django.contrib import admin
from django import forms
from .models import (
    Album,
    Photo,
    GuestMessage,
    StudioContent,
    Service,
    Testimonial,
    PortfolioImage,
    ServiceGalleryImage,
    PortfolioCategory,
    MediaItem,
    StudioStat,
    VideoCategory,
    Video,
    StudioContactInfo,
    SocialLink,
    ContactMessage,
)

class PhotoInline(admin.TabularInline):
    model = Photo
    extra = 0

class GuestMessageInline(admin.TabularInline):
    model = GuestMessage
    extra = 0
    readonly_fields = ['created_at']

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ('slug', 'names', 'date', 'created_at')
    inlines = [PhotoInline, GuestMessageInline]


@admin.register(StudioContent)
class StudioContentAdmin(admin.ModelAdmin):
    list_display = ('hero_title', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('hero_title', 'hero_subtitle')


class ServiceGalleryImageInline(admin.TabularInline):
    model = ServiceGalleryImage
    extra = 5
    fields = ('image', 'order')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon', 'order', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'description')
    inlines = [ServiceGalleryImageInline]
    



@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'order', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('order', 'is_active')
    search_fields = ('name', 'role')


class PortfolioImageInline(admin.TabularInline):
    model = PortfolioImage
    extra = 3
    fields = ('image', 'order', 'is_active')


@admin.register(PortfolioCategory)
class PortfolioCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('order', 'is_active')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    inlines = [PortfolioImageInline]


@admin.register(PortfolioImage)
class PortfolioImageAdmin(admin.ModelAdmin):
    list_display = ('category', 'order', 'is_active', 'created_at')
    list_filter = ('category', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('category__name',)
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if not obj:  # Only for new objects
            form.base_fields['image'].help_text = 'For multiple uploads, use the API endpoints or management command'
        return form


@admin.register(MediaItem)
class MediaItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'media_type', 'order', 'is_active', 'created_at')
    list_filter = ('media_type', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('title',)


@admin.register(StudioStat)
class StudioStatAdmin(admin.ModelAdmin):
    list_display = ('label', 'value', 'icon', 'order', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('order', 'is_active')
    search_fields = ('label', 'value')


class SocialLinkInline(admin.TabularInline):
    model = SocialLink
    extra = 1
    fields = ('platform', 'icon', 'url', 'order', 'is_active')


@admin.register(StudioContactInfo)
class StudioContactInfoAdmin(admin.ModelAdmin):
    list_display = ('phone', 'email', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('phone', 'email', 'address')
    inlines = [SocialLinkInline]


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ('platform', 'url', 'order', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('order', 'is_active')
    search_fields = ('platform', 'url')


class VideoInline(admin.TabularInline):
    model = Video
    extra = 0
    fields = ('title', 'video_file', 'order', 'is_active')


@admin.register(VideoCategory)
class VideoCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('order', 'is_active')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    inlines = [VideoInline]


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'duration', 'year', 'order', 'is_active')
    list_filter = ('category', 'is_active', 'year')
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'description')


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'service_type', 'status', 'created_at')
    list_filter = ('status', 'service_type', 'created_at')
    list_editable = ('status',)
    search_fields = ('full_name', 'email', 'project_details')
    readonly_fields = ('ip_address', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('full_name', 'email', 'phone')
        }),
        ('Message Details', {
            'fields': ('service_type', 'project_details')
        }),
        ('Status & Metadata', {
            'fields': ('status', 'ip_address', 'created_at', 'updated_at')
        }),
    )
