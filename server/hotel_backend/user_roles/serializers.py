from .models import CustomUsers
from rest_framework import serializers

class CustomUserSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUsers
        fields = ['id', 'email', 'first_name', 'last_name', 'profile_image']
        extra_kwargs = { 'password': { 'write_only': True } }
        
    def get_profile_image(self, obj):
        if obj.profile_image:
            return obj.profile_image.url
        return ""