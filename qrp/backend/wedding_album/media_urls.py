from django.conf import settings
from django.http import HttpResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import os
import mimetypes

# Ensure modern image/video types resolve correctly even on hosts
# where the system mimetypes database is incomplete.
mimetypes.add_type('image/webp', '.webp')
mimetypes.add_type('image/avif', '.avif')
mimetypes.add_type('video/mp4', '.mp4')
mimetypes.add_type('video/webm', '.webm')

@csrf_exempt
@require_http_methods(["GET"])
def serve_media(request, path):
    """Serve media files with proper CORS headers"""
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        raise Http404("File not found")
    
    # Get the file's MIME type
    content_type, _ = mimetypes.guess_type(file_path)
    if content_type is None:
        content_type = 'application/octet-stream'
    
    try:
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type=content_type)
            
        # Add CORS headers
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        
        # Add caching headers for images
        if content_type.startswith('image/'):
            response['Cache-Control'] = 'public, max-age=31536000'  # 1 year
            
        return response
        
    except IOError:
        raise Http404("File not found")