# Generated by Django 5.1.7 on 2025-04-09 04:05

import cloudinary.models
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('property', '__first__'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Bookings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('check_in_date', models.DateField()),
                ('check_out_date', models.DateField()),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('reserved', 'Reserved'), ('confirmed', 'Confirmed'), ('checked_in', 'Checked In'), ('checked_out', 'Checked Out'), ('cancelled', 'Cancelled'), ('rejected', 'Rejected'), ('missed_reservation', 'Missed Reservation')], default='pending', max_length=20)),
                ('valid_id', cloudinary.models.CloudinaryField(max_length=255, verbose_name='valid_id')),
                ('special_request', models.TextField(blank=True, null=True)),
                ('cancellation_date', models.DateTimeField(blank=True, null=True)),
                ('cancellation_reason', models.TextField(blank=True, null=True)),
                ('total_price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('is_venue_booking', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('start_time', models.TimeField(blank=True, null=True)),
                ('end_time', models.TimeField(blank=True, null=True)),
                ('payment_status', models.CharField(default='unpaid', max_length=20)),
                ('area', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='area_bookings', to='property.areas')),
                ('room', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='property.rooms')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'bookings',
            },
        ),
        migrations.CreateModel(
            name='Reservations',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('end_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('valid_id', cloudinary.models.CloudinaryField(blank=True, max_length=255, null=True, verbose_name='valid_id')),
                ('special_request', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')], default='confirmed', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('area', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservations', to='property.areas')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'reservations',
            },
        ),
        migrations.CreateModel(
            name='Transactions',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_type', models.CharField(choices=[('booking', 'Booking'), ('reservation', 'Reservation'), ('cancellation_refund', 'Cancellation Refund')], max_length=30)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('transaction_date', models.DateTimeField(auto_now_add=True)),
                ('status', models.CharField(choices=[('completed', 'Completed'), ('pending', 'Pending'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('booking', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='booking.bookings')),
                ('reservation', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='booking.reservations')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'transactions',
            },
        ),
        migrations.CreateModel(
            name='Reviews',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('review_text', models.TextField(blank=True)),
                ('rating', models.PositiveSmallIntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('booking', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='booking.bookings')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'reviews',
                'constraints': [models.CheckConstraint(condition=models.Q(('rating__gte', 1), ('rating__lte', 5)), name='valid_rating')],
            },
        ),
    ]
