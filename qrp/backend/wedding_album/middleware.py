from django.utils.cache import patch_cache_control

class MediaCacheMiddleware:
    """Add cache headers to media files"""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Add cache headers for media files
        if request.path.startswith('/media/'):
            # Cache for 1 year (immutable content)
            patch_cache_control(
                response,
                public=True,
                max_age=31536000,  # 1 year
                immutable=True
            )
        
        return response
