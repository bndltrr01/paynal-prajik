# Generated manually

from django.db import migrations, models
import django.db.models.deletion
import cloudinary.models


class Migration(migrations.Migration):

    dependencies = [
        ('property', '0001_initial'),
        ('booking', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='bookings',
            name='area',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='area_bookings', to='property.areas'),
        ),
        migrations.AddField(
            model_name='bookings',
            name='is_venue_booking',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='bookings',
            name='total_price',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='reservations',
            name='special_request',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='reservations',
            name='valid_id',
            field=cloudinary.models.CloudinaryField(blank=True, max_length=255, null=True, verbose_name='valid_id'),
        ),
        migrations.AlterField(
            model_name='bookings',
            name='room',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='property.rooms'),
        ),
    ] 