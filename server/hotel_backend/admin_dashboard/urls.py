from django.urls import path
from . import views

# /master/** routes
urlpatterns = [
    path('details', views.get_admin_details, name='get_admin_details'),
    path('stats', views.dashboard_stats, name='dashboard_stats'),
    path('area_reservations', views.area_reservations, name='area_reservations'),
    path('manage_users', views.manage_users, name='manage_users'),
    
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
]
