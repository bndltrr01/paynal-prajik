from django.urls import path
from . import views

# /property/** routes
urlpatterns = [
    path('rooms/', views.fetch_rooms, name='fetch_rooms'),
    path('areas/', views.fetch_areas, name='fetch_areas'),
    path('amenities/', views.fetch_amenities, name='fetch_amenities'),
]
