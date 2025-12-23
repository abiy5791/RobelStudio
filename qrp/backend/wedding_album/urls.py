from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('albums.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # In production, serve media files through custom view with CORS
    from django.urls import re_path
    from .media_urls import serve_media
    
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve_media, name='serve_media'),
    ]
