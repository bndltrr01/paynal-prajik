from rest_framework import serializers
from .models import Bookings, Reservations, Transactions, Reviews
from user_roles.models import CustomUsers
from property.models import Rooms, Amenities
import cloudinary # type: ignore
from datetime import datetime

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
    user = serializers.SerializerMethodField()
    valid_id = serializers.SerializerMethodField()
    
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
            'valid_id',
            'special_request',
            'cancellation_date',
            'cancellation_reason',
            'created_at',
            'updated_at'
        ]
    
    def get_user(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'email': obj.user.email,
                'profile_image': obj.user.profile_image.url if obj.user.profile_image else None,
            }
        return None
        
    def get_valid_id(self, obj):
        if obj.valid_id:
            # Handle both CloudinaryField objects and string URLs
            if hasattr(obj.valid_id, 'url'):
                return obj.valid_id.url
            else:
                # If it's already a string URL, return it directly
                return obj.valid_id
        return None

class BookingRequestSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=100)
    lastName = serializers.CharField(max_length=100)
    phoneNumber = serializers.CharField(max_length=20)
    emailAddress = serializers.EmailField()
    specialRequests = serializers.CharField(required=False, allow_blank=True)
    validId = serializers.FileField(required=True)
    roomId = serializers.CharField()
    checkIn = serializers.DateField()
    checkOut = serializers.DateField()
    status = serializers.CharField(default='pending')
    isVenueBooking = serializers.BooleanField(required=False, default=False)
    totalPrice = serializers.DecimalField(required=False, max_digits=10, decimal_places=2)

    
    def create(self, validated_data):
        request = self.context.get('request')
        print(f"Creating booking with data: {validated_data.keys()}")
        
        if request and request.user and request.user.is_authenticated:
            user = request.user
            print(f"Using authenticated user: {user.email}")
            if user.first_name != validated_data['firstName'] or user.last_name != validated_data['lastName']:
                user.first_name = validated_data['firstName']
                user.last_name = validated_data['lastName']
                user.phone_number = validated_data['phoneNumber']
                user.save()
        else:
            try:
                user = CustomUsers.objects.get(email=validated_data['emailAddress'])
                print(f"Found existing user: {user.email}")
            except CustomUsers.DoesNotExist:
                user = CustomUsers.objects.create(
                    email=validated_data['emailAddress'],
                    first_name=validated_data['firstName'],
                    last_name=validated_data['lastName'],
                    phone_number=validated_data['phoneNumber'],
                    role='guest'
                )
                print(f"Created new user: {user.email}")

        # Check if this is a venue booking
        is_venue_booking = validated_data.get('isVenueBooking', False)
        
        valid_id = validated_data.get('validId')
        if valid_id:
            print(f"Uploading valid ID file: {valid_id.name}, size: {valid_id.size}")
            try:
                upload_result = cloudinary.uploader.upload(valid_id)
                valid_id_url = upload_result['secure_url']
                print(f"Valid ID uploaded successfully: {valid_id_url}")
            except Exception as e:
                print(f"Error uploading to Cloudinary: {str(e)}")
                raise serializers.ValidationError(f"Error uploading ID: {str(e)}")
        else:
            print("Valid ID is missing")
            raise serializers.ValidationError("Valid ID is required")

        # If it's a venue booking, create a Reservation
        if is_venue_booking:
            try:
                from property.models import Areas
                area_id = validated_data['roomId']  # Using roomId to store areaId for compatibility
                try:
                    area = Areas.objects.get(id=area_id)
                    print(f"Found area: {area.area_name} (ID: {area.id})")
                except Areas.DoesNotExist:
                    print(f"Area not found: {area_id}")
                    raise serializers.ValidationError("Area not found")
                
                # Convert the dates to datetime objects for start_time and end_time
                start_time = datetime.combine(validated_data['checkIn'], datetime.min.time())
                end_time = datetime.combine(validated_data['checkOut'], datetime.min.time())
                
                total_price = validated_data.get('totalPrice', 0)
                
                reservation = Reservations.objects.create(
                    user=user,
                    area=area,
                    start_time=start_time,
                    end_time=end_time,
                    total_price=total_price,
                    status=validated_data.get('status', 'confirmed')
                )
                print(f"Venue reservation created successfully: ID {reservation.id}")
                
                # For compatibility with the existing API, we return a simplified structure
                # that mimics a Booking object with the necessary fields
                return {
                    'id': reservation.id,
                    'user': user,
                    'reservation': reservation,
                    'is_venue_booking': True,
                    'valid_id': valid_id_url,
                    'special_request': validated_data.get('specialRequests', '')
                }
            except Exception as e:
                print(f"Error creating reservation: {str(e)}")
                raise serializers.ValidationError(str(e))
        else:
            # Regular room booking
            try:
                room = Rooms.objects.get(id=validated_data['roomId'])
                print(f"Found room: {room.room_name} (ID: {room.id})")
                
                booking = Bookings.objects.create(
                    user=user,
                    room=room,
                    check_in_date=validated_data['checkIn'],
                    check_out_date=validated_data['checkOut'],
                    status=validated_data.get('status', 'pending'),
                    valid_id=valid_id_url,
                    special_request=validated_data.get('specialRequests', '')
                )
                print(f"Booking created successfully: ID {booking.id}, Valid ID: {booking.valid_id}")
                
                # Verify the URL is accessible
                if booking.valid_id:
                    try:
                        url = booking.valid_id.url
                        print(f"Valid ID URL is accessible: {url}")
                    except Exception as e:
                        print(f"Error accessing valid_id URL: {str(e)}")
                
                return booking
            except Rooms.DoesNotExist:
                print(f"Room not found: {validated_data.get('roomId')}")
                raise serializers.ValidationError("Room not found")
            except Exception as e:
                print(f"Error creating booking: {str(e)}")
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