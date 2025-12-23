# Quick Setup Commands

## Backend Setup (Run these in order)

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Create migrations for the new owner field
python manage.py makemigrations albums

# Apply all migrations
python manage.py migrate

# (Optional) Create a superuser for admin access
python manage.py createsuperuser

# Run the development server
python manage.py runserver
```

## Frontend Setup (In a new terminal)

```powershell
# Navigate to frontend directory
cd FrontEnd

# Install dependencies (if not already installed)
npm install

# Run the development server
npm run dev
```

## Testing the Authentication

1. **Open browser**: http://localhost:5173
2. **Register**: Click "Sign In" → "Create one" → Fill form
3. **Create Album**: You'll be redirected to dashboard → Click "Create Album"
4. **Test CRUD**:
   - Create: Upload photos and create album
   - Read: View album from dashboard or public URL
   - Update: Click edit icon on album in dashboard
   - Delete: Click delete icon on album in dashboard

## Quick Database Reset (If Needed)

```powershell
cd backend

# Delete the database
Remove-Item db.sqlite3

# Recreate database
python manage.py migrate

# Create new superuser
python manage.py createsuperuser
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register/` - Register
- `POST /api/auth/login/` - Login
- `GET /api/auth/profile/` - Get profile
- `POST /api/auth/token/refresh/` - Refresh token

### Albums
- `GET /api/albums/` - List all (public)
- `POST /api/albums/` - Create (auth required)
- `GET /api/albums/my/` - My albums (auth required)
- `GET /api/albums/<slug>/` - View album (public)
- `PATCH /api/albums/<slug>/` - Update (owner only)
- `DELETE /api/albums/<slug>/` - Delete (owner only)

### Other
- `POST /api/uploads/images/` - Upload images (auth required)
- `POST /api/albums/<slug>/messages/` - Post message (public)
- `POST /api/albums/<slug>/photos/<id>/like/` - Like photo (public)
