# Custom migration to handle dynamic portfolio models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('albums', '0008_portfolioimage_service_studiocontent_testimonial'),
    ]

    operations = [
        # Delete existing portfolio images first
        migrations.RunSQL("DELETE FROM albums_portfolioimage;"),
        
        # Remove old fields
        migrations.RemoveField(
            model_name='portfolioimage',
            name='category',
        ),
        migrations.RemoveField(
            model_name='portfolioimage',
            name='url',
        ),
        migrations.RemoveField(
            model_name='service',
            name='gallery_images',
        ),
        
        # Create PortfolioCategory model
        migrations.CreateModel(
            name='PortfolioCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True)),
                ('slug', models.SlugField(unique=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'Portfolio Categories',
                'ordering': ['order', 'name'],
            },
        ),
        
        # Add new fields to PortfolioImage
        migrations.AddField(
            model_name='portfolioimage',
            name='image',
            field=models.ImageField(upload_to='portfolio/%Y/%m/', default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='portfolioimage',
            name='category',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='albums.portfoliocategory', default=1),
            preserve_default=False,
        ),
        
        # Create ServiceGalleryImage model
        migrations.CreateModel(
            name='ServiceGalleryImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='services/%Y/%m/')),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='gallery_images', to='albums.service')),
            ],
            options={
                'ordering': ['order', 'created_at'],
            },
        ),
        
        # Update Testimonial avatar field
        migrations.AlterField(
            model_name='testimonial',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='testimonials/'),
        ),
        
        # Remove icon choices from Service
        migrations.AlterField(
            model_name='service',
            name='icon',
            field=models.CharField(default='FiCamera', help_text='Icon name (e.g., FiCamera, FiUsers)', max_length=50),
        ),
    ]