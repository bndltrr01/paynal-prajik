from rest_framework import serializers
from .models import Amenities, Rooms, Areas
from cloudinary.utils import cloudinary_url # type: ignore

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenities
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    # room_image = serializers.ImageField()
    
    class Meta:
        model = Rooms
        fields = [
            'id',
            'admission',
            'room_name',
            'room_number',
            'room_type',
            'status',
            'room_price',
            'room_image',
            'description',
            'bed_size',
            'pax',
        ]
        read_only_fields = ['room_number']
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['room_image'] = instance.room_image.url if instance.room_image else None
        return representation

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Areas
        fields = [
            'id',
            'area_name',
            'description',
            'area_image',
            'status',
            'capacity',
            'price_per_hour',
        ]
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['area_image'] = instance.area_image.url if instance.area_image else None
        return representation