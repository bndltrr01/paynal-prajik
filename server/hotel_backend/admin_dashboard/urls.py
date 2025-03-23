from django.urls import path
from . import views

# /master/** routes
urlpatterns = [
    path('details', views.get_admin_details, name='get_admin_details'),
    path('stats', views.dashboard_stats, name='dashboard_stats'),
    path('area_reservations', views.area_reservations, name='area_reservations'),
    
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
    
    # CRUD Users
    path('staff', views.fetch_all_staff, name='fetch_all_staff'),
    path('add_staff', views.add_new_staff, name='add_new_staff'),
    path('show_staff/<int:staff_id>', views.show_staff_details, name='show_staff_details'),
    path('edit_staff/<int:staff_id>', views.edit_staff, name='edit_staff'),
    path('delete_staff/<int:staff_id>', views.archive_staff, name='delete_staff'),
]
