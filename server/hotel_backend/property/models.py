from django.db import models
from cloudinary.models import CloudinaryField # type: ignore

# Create your models here.
class Amenities(models.Model):
    name = models.CharField(max_length=100, unique=True, null=False)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'amenities'

class RoomAmenities(models.Model):
    amenity = models.ForeignKey(Amenities, on_delete=models.CASCADE, related_name='amenities')
    
    class Meta:
        db_table = 'room_amenities'

class Rooms(models.Model):
    ROOM_STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Maintenance'),
    ]
    
    ADMISSION_CHOICES = [
        ('regular', 'Regular'),
        ('vip', 'VIP'),
    ]
    
    admission = models.CharField(
        max_length=20,
        choices=ADMISSION_CHOICES,
        default='regular',
    )
    room_name = models.CharField(max_length=100, null=False, default="Room")
    room_number = models.CharField(max_length=10, unique=True, null=False)
    room_type = models.CharField(max_length=100, null=False)
    status = models.CharField(
        max_length=20,
        choices=ROOM_STATUS_CHOICES,
        default='available',
    )
    room_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    room_image = CloudinaryField('room_image', null=False, blank=False)
    description = models.TextField(blank=True)
    bed_size = models.CharField(max_length=30, null=False)
    pax = models.PositiveIntegerField(default=1)
    
    class Meta:
        db_table = 'rooms'

class Areas(models.Model):
    AREA_STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Maintenance'),
    ]
    
    area_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    capacity = models.IntegerField()
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(
        max_length=20,
        choices=AREA_STATUS_CHOICES,
        default='available',
    )
    area_image = CloudinaryField('area_image', null=True, blank=True)
    
    class Meta:
        db_table = 'areas'