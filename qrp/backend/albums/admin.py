from django.contrib import admin
from django import forms
from .models import Album, Photo, GuestMessage, StudioContent, Service, Testimonial, PortfolioImage, ServiceGalleryImage, PortfolioCategory, MediaItem, StudioStat

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
