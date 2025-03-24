from django.db import models
from property.models import Rooms, Areas
from user_roles.models import CustomUsers
from django.utils.timezone import now

# Create your models here.
class Bookings(models.Model):
    BOOKING_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('checked_in', 'Checked In'),
        ('checked_out', 'Checked Out'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(CustomUsers, on_delete=models.CASCADE, related_name='bookings')
    room = models.ForeignKey(Rooms, on_delete=models.CASCADE, related_name='bookings')
    check_in_date = models.DateField(null=False, blank=False)
    check_out_date = models.DateField(null=False, blank=False)
    status = models.CharField(
        max_length=20,
        choices=BOOKING_STATUS_CHOICES,
        default='pending',
    )
    cancellation_date = models.DateField(null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bookings'

class Reservations(models.Model):
    RESERVATION_STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(CustomUsers, on_delete=models.CASCADE, related_name='reservations')
    area = models.ForeignKey(Areas, on_delete=models.CASCADE, related_name='reservations')
    start_time = models.DateTimeField(default=now)
    end_time = models.DateTimeField(default=now)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=RESERVATION_STATUS_CHOICES,
        default='confirmed',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reservations'

class Transactions(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('booking', 'Booking'),
        ('reservation', 'Reservation'),
        ('cancellation_refund', 'Cancellation Refund'),
    ]
    TRANSACTION_STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    ]
    booking = models.ForeignKey(Bookings, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    reservation = models.ForeignKey(Reservations, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    user = models.ForeignKey(CustomUsers, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(
        max_length=30,
        choices=TRANSACTION_TYPE_CHOICES,
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=TRANSACTION_STATUS_CHOICES,
        default='pending',
    )
    
    class Meta:
        db_table = 'transactions'

class Reviews(models.Model):
    booking = models.ForeignKey(Bookings, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(CustomUsers, on_delete=models.CASCADE, related_name='reviews')
    review_text = models.TextField(blank=True)
    rating = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(rating__gte=1) & models.Q(rating__lte=5),
                name="valid_rating"
            )
        ]
        db_table = 'reviews'
