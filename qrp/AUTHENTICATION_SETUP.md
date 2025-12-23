# Authentication Setup Guide

## ✅ Implementation Complete

I've successfully implemented JWT-based authentication with full CRUD operations for albums. Here's what was added:

## 🔐 Backend Changes

### 1. **Authentication System**
- ✅ JWT token-based authentication using `djangorestframework-simplejwt`
- ✅ User registration endpoint (`/api/auth/register/`)
- ✅ Login endpoint (`/api/auth/login/`)
- ✅ Token refresh endpoint (`/api/auth/token/refresh/`)
- ✅ User profile endpoint (`/api/auth/profile/`)

### 2. **Album Ownership**
- ✅ Added `owner` field to Album model (ForeignKey to User)
- ✅ Albums are automatically assigned to the authenticated user on creation
- ✅ Only album owners can edit/delete their albums

### 3. **Permissions**
- ✅ **Album Creation**: Requires authentication
- ✅ **Image Upload**: Requires authentication
- ✅ **Album Viewing**: Public (no auth required) ✓
- ✅ **Album Editing**: Owner only
- ✅ **Album Deletion**: Owner only
- ✅ **Guest Messages**: Public (no auth required)
- ✅ **Photo Likes**: Public with IP tracking

### 4. **New API Endpoints**

#### Authentication
```
POST /api/auth/register/          - Register new user
POST /api/auth/login/             - Login user
POST /api/auth/token/refresh/     - Refresh access token
GET  /api/auth/profile/           - Get current user profile
```

#### Albums (CRUD)
```
GET    /api/albums/               - List all albums (public)
POST   /api/albums/               - Create album (authenticated)
GET    /api/albums/my/            - Get user's albums (authenticated)
GET    /api/albums/<slug>/        - View album (public)
PATCH  /api/albums/<slug>/        - Update album (owner only)
DELETE /api/albums/<slug>/        - Delete album (owner only)
```

## 🎨 Frontend Changes

### 1. **New Pages**
- ✅ `/login` - Login page
- ✅ `/register` - Registration page
- ✅ `/dashboard` - User's album management dashboard
- ✅ `/edit/:slug` - Edit album page

### 2. **Authentication Context**
- ✅ Global auth state management
- ✅ Automatic token refresh
- ✅ Protected routes for authenticated pages

### 3. **Updated Components**
- ✅ Header now shows login/dashboard based on auth status
- ✅ Create Album page requires authentication
- ✅ Dashboard shows user's albums with edit/delete options

### 4. **Features**
- ✅ User registration with validation
- ✅ Login with username/password
- ✅ Automatic token storage in localStorage
- ✅ Protected routes redirect to login
- ✅ Album CRUD operations (Create, Read, Update, Delete)
- ✅ QR code download for each album
- ✅ Visual album management interface

## 📋 Setup Instructions

### Backend Setup

1. **Install new dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Create and apply migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

3. **Create a superuser (optional, for admin access):**
```bash
python manage.py createsuperuser
```

4. **Run the development server:**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Install dependencies (if needed):**
```bash
cd FrontEnd
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

## 🚀 Usage Flow

### For New Users:
1. Visit the landing page
2. Click "Create Album" or "Sign In" in header
3. Register a new account at `/register`
4. Automatically logged in and redirected to dashboard
5. Create albums from dashboard or `/create` page
6. Manage albums from dashboard (edit, delete, download QR)

### For Existing Users:
1. Click "Sign In" in header
2. Login at `/login`
3. Access dashboard to see all your albums
4. Edit album details (names, date, description, category, download settings)
5. Delete albums you no longer need
6. Download QR codes for sharing

### For Public Viewers:
1. Scan QR code or visit album URL
2. View photos, like photos, leave messages
3. Download photos (if owner enabled downloads)
4. **No authentication required for viewing!**

## 🔒 Security Features

- ✅ JWT tokens with 1-day expiration
- ✅ Refresh tokens with 7-day expiration
- ✅ Password hashing (Django default)
- ✅ CORS configured for frontend
- ✅ Owner-only permissions for album modifications
- ✅ IP-based like tracking to prevent spam

## ⚠️ Important Notes

### Database Migration
**CRITICAL**: The Album model now requires an `owner` field. If you have existing albums in your database:

**Option 1: Fresh Start (Recommended for Development)**
```bash
# Delete database and start fresh
cd backend
rm db.sqlite3
python manage.py migrate
```

**Option 2: Migrate Existing Data**
If you have existing albums you want to keep:
1. Create a default user first
2. Manually assign existing albums to that user
3. Or contact me for a custom migration script

### Frontend Environment
Make sure your frontend `.env` file has:
```
VITE_API_BASE=http://localhost:8000
```

### Production Deployment
For production:
1. Set strong `SECRET_KEY` in Django settings
2. Set `DEBUG=False`
3. Configure proper `ALLOWED_HOSTS`
4. Use HTTPS for token security
5. Consider using httpOnly cookies instead of localStorage for tokens

## 📊 What's Protected vs Public

### 🔴 Protected (Requires Authentication):
- Creating albums
- Uploading images
- Editing albums
- Deleting albums
- Accessing dashboard
- Viewing "My Albums"

### 🟢 Public (No Authentication):
- Viewing albums (via QR code or URL)
- Viewing album gallery
- Liking photos (IP-tracked)
- Leaving guest messages
- Downloading photos (if enabled by owner)

## 🎯 Testing the Implementation

1. **Register a new user:**
   - Go to `/register`
   - Fill in username, email, password
   - Should auto-login and redirect to dashboard

2. **Create an album:**
   - From dashboard, click "Create Album"
   - Upload photos and fill details
   - Should see album in dashboard

3. **Edit an album:**
   - From dashboard, hover over album
   - Click edit icon
   - Modify details and save

4. **Delete an album:**
   - From dashboard, hover over album
   - Click delete icon
   - Confirm deletion

5. **Test public access:**
   - Logout
   - Visit album URL directly
   - Should still be able to view without login

## 🐛 Troubleshooting

### "401 Unauthorized" errors:
- Check if token is stored in localStorage
- Try logging out and back in
- Check browser console for errors

### "403 Forbidden" on edit/delete:
- Ensure you're the album owner
- Check if you're logged in
- Verify token hasn't expired

### Migration errors:
- Delete `db.sqlite3` and migrations folder
- Run `python manage.py makemigrations` again
- Run `python manage.py migrate`

## 📝 Next Steps (Optional Enhancements)

- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Social authentication (Google, Facebook)
- [ ] Album collaboration (multiple owners)
- [ ] Analytics dashboard
- [ ] Rate limiting for API endpoints
- [ ] Album password protection
- [ ] Bulk photo upload
- [ ] Photo reordering in edit mode

---

**Implementation Status**: ✅ Complete and Ready to Use!

All authentication and CRUD operations are fully functional. The system maintains public album viewing while protecting album management features.
