from django.urls import path
from . import views

# /property/** routes
urlpatterns = [
    path('rooms', views.fetch_rooms, name='fetch_rooms'),
    path('rooms/', views.fetch_rooms, name='fetch_rooms_slash'),  # With trailing slash
    path('rooms/<int:id>', views.fetch_room_detail, name='fetch_room_detail'),
    path('rooms/<int:id>/', views.fetch_room_detail, name='fetch_room_detail_slash'),  # With trailing slash
    path('areas', views.fetch_areas, name='fetch_areas'),
    path('areas/', views.fetch_areas, name='fetch_areas_slash'),  # With trailing slash
    path('areas/<int:id>', views.fetch_area_detail, name='fetch_area_detail'),
    path('areas/<int:id>/', views.fetch_area_detail, name='fetch_area_detail_slash'),  # With trailing slash
    path('amenities', views.fetch_amenities, name='fetch_amenities'),
    path('amenities/', views.fetch_amenities, name='fetch_amenities_slash'),  # With trailing slash
]
