from rest_framework import serializers
from .models import Bookings, Reservations, Transactions, Reviews
from user_roles.models import CustomUsers
from property.models import Rooms, Amenities

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenities
        fields = ['id', 'description']

class RoomSerializer(serializers.ModelSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)
    room_image = serializers.SerializerMethodField()
    
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
            'amenities'
        ]
    
    def get_room_image(self, obj):
        if obj.room_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.room_image.url)
            return obj.room_image.url
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.room_price is not None:
            representation['room_price'] = f"₱{float(instance.room_price):,.2f}"
        return representation

class BookingSerializer(serializers.ModelSerializer):
    room_details = RoomSerializer(source='room', read_only=True)
    
    class Meta:
        model = Bookings
        fields = [
            'id',
            'user',
            'room',
            'room_details',
            'check_in_date',
            'check_out_date',
            'status',
            'created_at',
            'updated_at'
        ]

class BookingRequestSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=100)
    lastName = serializers.CharField(max_length=100)
    phoneNumber = serializers.CharField(max_length=20)
    emailAddress = serializers.EmailField()
    address = serializers.CharField(max_length=200)
    specialRequests = serializers.CharField(required=False, allow_blank=True)
    roomId = serializers.CharField()
    checkIn = serializers.DateField()
    checkOut = serializers.DateField()
    status = serializers.CharField(default='pending')
    
    def create(self, validated_data):
        # Find or create user
        try:
            user = CustomUsers.objects.get(email=validated_data['emailAddress'])
        except CustomUsers.DoesNotExist:
            # Create a new user with a temporary password
            user = CustomUsers.objects.create(
                email=validated_data['emailAddress'],
                first_name=validated_data['firstName'],
                last_name=validated_data['lastName'],
                phone_number=validated_data['phoneNumber'],
                address=validated_data['address'],
                role='guest'
            )
            
        # Create booking
        try:
            room = Rooms.objects.get(id=validated_data['roomId'])
            booking = Bookings.objects.create(
                user=user,
                room=room,
                check_in_date=validated_data['checkIn'],
                check_out_date=validated_data['checkOut'],
                status=validated_data.get('status', 'pending')
            )
            return booking
        except Rooms.DoesNotExist:
            raise serializers.ValidationError("Room not found")
        except Exception as e:
            raise serializers.ValidationError(str(e))

class ReservationSerializer(serializers.ModelSerializer):
    guest_name = serializers.SerializerMethodField()
    area_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Reservations
        fields = '__all__'
    
    def get_guest_name(self, obj):
        return obj.user.first_name + " " + obj.user.last_name if obj.user else "Unknown Guest"
    
    def get_area_name(self, obj):
        return obj.area.name if obj.area else "Unknown Area"

class TransactionSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Transactions
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reviews
        fields = '__all__'