# Generated migration for adding owner field to Album model

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def create_default_user(apps, schema_editor):
    """Create a default user for existing albums if none exists"""
    User = apps.get_model('auth', 'User')
    Album = apps.get_model('albums', 'Album')
    
    # Check if there are any albums
    if Album.objects.exists():
        # Check if there's at least one user
        if not User.objects.exists():
            # Create a default user for existing albums
            User.objects.create_user(
                username='default_user',
                email='default@example.com',
                password='changeme123',
                first_name='Default',
                last_name='User'
            )
            print("\n" + "="*60)
            print("IMPORTANT: Created default user for existing albums")
            print("Username: default_user")
            print("Password: changeme123")
            print("Please change this password immediately!")
            print("="*60 + "\n")


def assign_albums_to_default_user(apps, schema_editor):
    """Assign all existing albums to the first user"""
    User = apps.get_model('auth', 'User')
    Album = apps.get_model('albums', 'Album')
    
    # Get the first user (or the default user we just created)
    if User.objects.exists() and Album.objects.exists():
        default_user = User.objects.first()
        # Update all albums without an owner
        Album.objects.filter(owner__isnull=True).update(owner=default_user)


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('albums', '0005_album_allow_downloads'),
    ]

    operations = [
        # First, create default user if needed
        migrations.RunPython(create_default_user, migrations.RunPython.noop),
        
        # Add the owner field as nullable first
        migrations.AddField(
            model_name='album',
            name='owner',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='albums',
                to=settings.AUTH_USER_MODEL
            ),
        ),
        
        # Assign existing albums to default user
        migrations.RunPython(assign_albums_to_default_user, migrations.RunPython.noop),
        
        # Make the field non-nullable
        migrations.AlterField(
            model_name='album',
            name='owner',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='albums',
                to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
