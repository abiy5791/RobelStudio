# 🧪 Testing Guide

## Quick Start Testing

### 1. Test Backend Optimizations

```bash
cd backend

# Run migrations
python manage.py migrate

# Optimize existing images (if you have existing data)
python manage.py optimize_existing_images

# Start server
python manage.py runserver
```

### 2. Test Frontend

```bash
cd FrontEnd

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

### 3. Test Image Upload

1. Create a new album
2. Upload 5-10 high-quality images (2-5MB each)
3. Check browser Network tab:
   - Should see WebP images
   - Thumbnails should be ~50-100KB
   - Medium images should be ~200-400KB
   - Full images should be ~500KB-1MB

### 4. Test Performance

#### Page Load Speed
1. Open album page
2. Check Network tab:
   - Initial load should use thumbnails
   - Full images load only in lightbox
   - Total page size should be 80-90% smaller

#### Database Queries
1. Install Django Debug Toolbar (optional):
```bash
pip install django-debug-toolbar
```

2. Check queries per page:
   - Album list: 3-5 queries
   - Album detail: 5-8 queries
   - Before optimization: 50+ queries

#### Cache Headers
1. Open DevTools Network tab
2. Check response headers for media files:
   - Should see `Cache-Control: public, max-age=31536000, immutable`
   - Should see `Content-Encoding: gzip`

## Performance Benchmarks

### Expected Results

#### Image Sizes
- **Original**: 3-5MB
- **Full (WebP)**: 500KB-1MB (80% reduction)
- **Medium (WebP)**: 200-400KB (90% reduction)
- **Thumbnail (WebP)**: 50-100KB (97% reduction)

#### Page Load Times
- **Album List**: < 1 second
- **Album Detail (20 photos)**: 1-2 seconds
- **Lightbox Open**: < 500ms

#### Database Performance
- **Album List Query**: < 50ms
- **Album Detail Query**: < 100ms
- **Photo Like Toggle**: < 20ms

## Testing Checklist

### Backend
- [ ] Image upload creates 3 versions (thumb, medium, full)
- [ ] All images converted to WebP
- [ ] Database indexes working (check query plans)
- [ ] Pagination working (20 items per page)
- [ ] Cache headers on media files
- [ ] GZip compression enabled
- [ ] API responses compressed

### Frontend
- [ ] Progressive image loading (blur-up effect)
- [ ] Thumbnails in grid view
- [ ] Medium-res in lightbox
- [ ] Lazy loading working
- [ ] Code splitting (check Network tab for chunks)
- [ ] Optimistic UI updates (likes)
- [ ] No unnecessary re-renders

### User Experience
- [ ] Fast initial page load
- [ ] Smooth scrolling
- [ ] Quick image transitions
- [ ] Responsive on mobile
- [ ] Works offline (cached images)

## Troubleshooting

### Images Not Optimizing
```bash
# Check Pillow installation
python -c "from PIL import Image; print(Image.__version__)"

# Test image processor
python manage.py shell
>>> from albums.image_processor import ImageProcessor
>>> # Should not throw errors
```

### Slow Page Load
1. Check Network tab for large files
2. Verify thumbnails are being used
3. Check database query count
4. Verify cache headers

### Build Errors
```bash
# Clear cache and rebuild
cd FrontEnd
rm -rf node_modules/.vite
npm run build
```

## Performance Testing Tools

### Lighthouse
```bash
# Install
npm install -g lighthouse

# Run test
lighthouse http://localhost:5173 --view
```

### WebPageTest
Visit: https://www.webpagetest.org/
Enter your URL and run test

### Django Debug Toolbar
```python
# Add to settings.py (development only)
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
INTERNAL_IPS = ['127.0.0.1']
```

## Load Testing

### Simple Load Test
```bash
# Install Apache Bench
# Windows: Download from Apache website
# Mac: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test album list
ab -n 1000 -c 10 http://localhost:8000/api/albums/

# Test album detail
ab -n 1000 -c 10 http://localhost:8000/api/albums/your-album-slug/
```

### Expected Results
- **Requests per second**: 100-200 (without cache)
- **Requests per second**: 500-1000 (with cache)
- **Average response time**: 10-50ms

## Monitoring in Production

### Key Metrics
1. **Response Time**: < 200ms average
2. **Error Rate**: < 0.1%
3. **Cache Hit Rate**: > 80%
4. **Image Processing Time**: < 2s per image
5. **Database Query Time**: < 50ms average

### Tools
- Sentry (errors)
- New Relic (performance)
- CloudWatch (AWS)
- Google Analytics (user metrics)
