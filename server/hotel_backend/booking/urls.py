from django.urls import path
from . import views

# /booking/** routes
urlpatterns = [
    path('availability', views.fetch_availability, name='fetch_availability'),
    path('bookings', views.bookings_list, name='bookings_list'),
    path('bookings/<int:booking_id>', views.booking_detail, name='booking_detail'),
    path('bookings/<int:booking_id>/cancel', views.cancel_booking, name='cancel_booking'),
    path('reservation', views.reservation_list, name='reservation_list'),
    path('reservation/<int:reservation_id>', views.reservation_detail, name='reservation_detail'),
    path('area_reservations', views.area_reservations, name='area_reservations'),
    path('rooms/<int:room_id>', views.room_detail, name='room_detail'),
    path('areas/<int:area_id>', views.area_detail, name='area_detail'),
    path('user/bookings', views.user_bookings, name='user_bookings'),
]