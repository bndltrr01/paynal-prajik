from rest_framework import serializers
from .models import Amenities, Rooms, Areas
from cloudinary.utils import cloudinary_url # type: ignore

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenities
        fields = ['id', 'description']

class RoomSerializer(serializers.ModelSerializer):
    amenities = serializers.PrimaryKeyRelatedField(queryset=Amenities.objects.all(), many=True, required=False)
    
    class Meta:
        model = Rooms
        fields = [
            'id',
            'room_name',
            'room_type',
            'status',
            'room_price',
            'room_image',
            'description',
            'capacity',
            'amenities',
        ]
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['room_image'] = instance.room_image.url if instance.room_image else None
        
        if instance.room_price is not None:
            representation['room_price'] = f"₱{instance.room_price:,.2f}"
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