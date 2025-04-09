from django.urls import path
from . import views

# /master/** routes
urlpatterns = [
    path('details', views.get_admin_details, name='get_admin_details'),
    path('stats', views.dashboard_stats, name='dashboard_stats'),
    path('area_reservations', views.area_reservations, name='area_reservations'),
    path('booking_status_counts', views.booking_status_counts, name='booking_status_counts'),
    
    # CRUD Rooms
    path('rooms', views.fetch_rooms, name='fetch_rooms'),
    path('add_room', views.add_new_room, name='add_new_room'),
    path('show_room/<int:room_id>', views.show_room_details, name='show_room_details'),
    path('edit_room/<int:room_id>', views.edit_room, name='edit_room'),
    path('delete_room/<int:room_id>', views.delete_room, name='delete_room'),
    
    # CRUD Areas
    path('areas', views.fetch_areas, name='fetch_areas'),
    path('add_area', views.add_new_area, name='add_new_area'),
    path('show_area/<int:area_id>', views.show_area_details, name='show_area_details'),
    path('edit_area/<int:area_id>', views.edit_area, name='edit_area'),
    path('delete_area/<int:area_id>', views.delete_area, name='delete_area'),
    
    # CRUD Amenities
    path('amenities', views.fetch_amenities, name='fetch_amenities'),
    path('add_amenity', views.create_amenity, name='create_amenity'),
    path('show_amenity/<int:pk>', views.retreive_amenity, name='retreive_amenity'),
    path('edit_amenity/<int:pk>', views.update_amenity, name='update_amenity'),
    path('delete_amenity/<int:pk>', views.delete_amenity, name='delete_amenity'),
    
    # Regular Users Management
    path('users', views.fetch_all_users, name='fetch_all_users'),
    path('show_user/<int:user_id>', views.show_user_details, name='show_user_details'),
    path('edit_user/<int:user_id>', views.manage_user, name='manage_user'),
    path('archive_user/<int:user_id>', views.archive_user, name='archive_user'),

    # Add booking management endpoints
    path('bookings', views.admin_bookings, name='admin_bookings'),
    path('booking/<int:booking_id>', views.booking_detail, name='admin_booking_detail'),
    path('booking/<int:booking_id>/status', views.update_booking_status, name='update_booking_status'),
    path('booking/<int:booking_id>/payment', views.record_payment, name='record_payment'),
]
