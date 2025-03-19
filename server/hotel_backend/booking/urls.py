from django.urls import path
from . import views

# /booking/** routes
urlpatterns = [
    path('bookings', views.bookings_list, name='bookings_list'),
    path("bookings/<int:booking_id>", views.booking_detail, name='booking_detail'),
    path('reservation', views.reservation_list, name='reservation_list'),
    path('reservation/<int:reservation_id>', views.reservation_detail, name='reservation_detail'),
    path('area_reservations', views.area_reservations, name='area_reservations'),
]