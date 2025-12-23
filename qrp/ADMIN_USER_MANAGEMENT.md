# Admin User Management - Invite-Only System

## ✅ Changes Implemented

Your application now has an **invite-only** registration system. Public users cannot register themselves - only admins or existing users can create new accounts.

## 🔒 What Changed

### **Frontend Changes**

1. ✅ **Removed public registration route** (`/register`)
2. ✅ **Removed "Sign Up" buttons** from landing page
3. ✅ **Updated login page** - shows "Contact your administrator for account access"
4. ✅ **Only "Sign In" button** visible to public users

### **Backend** (Already Configured)

- ✅ Registration endpoint still exists at `/api/auth/register/`
- ✅ Can be used by admin via Django admin panel
- ✅ Can be used programmatically by authorized users

## 👨‍💼 How to Create New Users

### **Method 1: Django Admin Panel (Recommended)**

1. **Access Django Admin**
   ```
   http://localhost:8000/admin/
   ```

2. **Login with superuser credentials**
   - If you don't have a superuser, create one:
   ```bash
   cd backend
   python manage.py createsuperuser
   ```

3. **Create New User**
   - Go to **Users** section
   - Click **Add User**
   - Enter username and password
   - Click **Save**
   - Add email, first name, last name (optional)
   - Click **Save** again

4. **Share Credentials**
   - Send username and password to the new user
   - They can login at your app's login page

### **Method 2: Django Shell**

```bash
cd backend
python manage.py shell
```

```python
from django.contrib.auth.models import User

# Create a new user
user = User.objects.create_user(
    username='newuser',
    email='newuser@example.com',
    password='securepassword123',
    first_name='John',
    last_name='Doe'
)

print(f"User created: {user.username}")
```

### **Method 3: Management Command (Create Custom)**

You can create a custom management command for easier user creation:

**File:** `backend/albums/management/commands/createuser.py`

```python
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create a new user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str)
        parser.add_argument('email', type=str)
        parser.add_argument('password', type=str)

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created user: {username}')
        )
```

**Usage:**
```bash
python manage.py createuser johndoe john@example.com password123
```

### **Method 4: API Endpoint (For Authorized Users)**

If you want existing users to invite others, you can create a protected endpoint:

**File:** `backend/albums/views.py`

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_user(request):
    """Allow authenticated users to create new accounts"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=400)
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    
    return Response({
        'message': 'User created successfully',
        'username': user.username
    })
```

Add to `urls.py`:
```python
path('auth/invite/', invite_user, name='invite-user'),
```

## 🎯 User Flow

### **New User Trying to Access**
1. Visits landing page
2. Clicks "Sign In"
3. Sees login form
4. Sees message: "Contact your administrator for account access"
5. Must contact admin to get credentials

### **Admin Creating User**
1. Access Django admin panel
2. Create new user with credentials
3. Share credentials with new user
4. New user can login and use the app

### **Existing User (If invite feature added)**
1. Login to dashboard
2. Click "Invite User" button (if you add this feature)
3. Enter new user details
4. New user receives credentials
5. New user can login

## 🔐 Security Benefits

✅ **Controlled Access**: Only authorized people can create accounts
✅ **No Spam**: No public registration means no spam accounts
✅ **Better Security**: Admin knows all users
✅ **Audit Trail**: All user creation logged in Django admin
✅ **Quality Control**: Admin can verify users before granting access

## 📊 Current Routes

### **Public Routes** (No Auth Required)
- `/` - Landing page
- `/login` - Login page
- `/albums/:slug` - View specific album (QR code)

### **Protected Routes** (Auth Required)
- `/dashboard` - User's albums
- `/create` - Create album
- `/edit/:slug` - Edit album
- `/recent_albums` - Gallery

### **Removed Routes**
- ❌ `/register` - Public registration (removed)

## 🚀 Next Steps (Optional Enhancements)

### **1. Add Invite Feature to Dashboard**
Create a UI for existing users to invite others:
- Add "Invite User" button in dashboard
- Form with username, email, password fields
- Sends invite via API
- Shows success message

### **2. Email Invitations**
Instead of sharing passwords:
- Generate unique invite tokens
- Send email with invite link
- User clicks link and sets their own password
- More secure and professional

### **3. Role-Based Invites**
Different user types:
- Admin: Can invite anyone
- Regular User: Can invite limited users
- Viewer: Cannot invite

### **4. Invite Tracking**
Track who invited whom:
- Add `invited_by` field to User model
- Show invite history in admin panel
- Limit invites per user

## 📝 Summary

Your app now has **invite-only registration**:

✅ Public users see only "Sign In"
✅ No public registration available
✅ Admin creates users via Django admin
✅ More secure and controlled
✅ Better for private/business use

**To create your first user (admin):**
```bash
cd backend
python manage.py createsuperuser
```

Then login at `http://localhost:8000/admin/` to manage users!
