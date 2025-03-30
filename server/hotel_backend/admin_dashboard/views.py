from django.utils import timezone
from django.db.models import Count, Sum
from .models import AdminDetails
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from booking.models import Bookings, Reservations, Transactions
from django.core.exceptions import ValidationError
from user_roles.serializers import CustomUserSerializer
from user_roles.models import CustomUsers
from property.models import Rooms, Amenities, Areas
from property.serializers import RoomSerializer, AmenitySerializer, AreaSerializer
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from booking.serializers import BookingSerializer

# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_details(request):
    user = request.user
    
    if user.role != 'admin':
        return Response({"error": "Only admin users can access this endpoint"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        admin_user = CustomUsers.objects.get(id=user.id, role='admin')
    
        data = {
            "name": admin_user.first_name + " " + admin_user.last_name,
            "role": admin_user.role,
            "profile_pic": admin_user.profile_image.url if admin_user.profile_image else None
        }
    
        return Response({
            'data': data
        }, status=status.HTTP_200_OK)
    except CustomUsers.DoesNotExist:
        return Response({"error": "Admin not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    now = timezone.now()
    
    try:
        active_bookings = Bookings.objects.filter(status__in=['confirmed', 'checked_in']).count()
        available_rooms = Rooms.objects.filter(status='available').count()
        occupied_rooms = Rooms.objects.filter(status='occupied').count()
        maintenance_rooms = Rooms.objects.filter(status='maintenance').count()
        upcoming_reservations = Reservations.objects.filter(start_time__gte=now).count()
        
        revenue = Transactions.objects.filter(status='completed').aggregate(total=Sum('amount'))['total']
        if revenue is None:
            revenue = 0.0
            
        room_transactions = Transactions.objects.filter(
            status='completed',
            booking__isnull=False,
            booking__is_venue_booking=False
        )
        room_revenue = room_transactions.aggregate(total=Sum('amount'))['total'] or 0.0
        
        venue_transactions = Transactions.objects.filter(
            status='completed',
            booking__isnull=False,
            booking__is_venue_booking=True
        )
        venue_revenue = venue_transactions.aggregate(total=Sum('amount'))['total'] or 0.0
        
        return Response({
            "active_bookings": active_bookings,
            "available_rooms": available_rooms,
            "occupied_rooms": occupied_rooms,
            "maintenance_rooms": maintenance_rooms,
            "upcoming_reservations": upcoming_reservations,
            "revenue": float(revenue),
            "room_revenue": float(room_revenue),
            "venue_revenue": float(venue_revenue)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def area_reservations(request):
    try:
        data = Reservations.objects.values('area').annotate(count=Count('area'))
        
        return Response({
            "data": data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Rooms
@api_view(['GET'])
def fetch_rooms(request):
    try:
        rooms = Rooms.objects.all().order_by('-id')
        
        # Get pagination parameters
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 9)
        
        # Create paginator
        paginator = Paginator(rooms, page_size)
        
        try:
            paginated_rooms = paginator.page(page)
        except PageNotAnInteger:
            paginated_rooms = paginator.page(1)
        except EmptyPage:
            paginated_rooms = paginator.page(paginator.num_pages)
        
        serializer = RoomSerializer(paginated_rooms, many=True)
        
        return Response({
            "data": serializer.data,
            "pagination": {
                "total_pages": paginator.num_pages,
                "current_page": int(page),
                "total_items": paginator.count,
                "page_size": int(page_size)
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_new_room(request):
    try:
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = RoomSerializer(instance).data
            return Response({
                "message": "Room added successfully",
                "data": data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def show_room_details(request, room_id):
    try:
        room = Rooms.objects.get(id=room_id)
        serializer = RoomSerializer(room)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Rooms.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_room(request, room_id):
    try:
        room = Rooms.objects.get(id=room_id)
    except Rooms.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
    
    has_active_bookings = Bookings.objects.filter(
        room=room,
        status__in=['reserved', 'confirmed', 'checked_in']
    ).exists()
    
    if has_active_bookings:
        allowed_fields = ['description', 'amenities', 'status']
        filtered_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        if 'status' in filtered_data and filtered_data['status'] == 'unavailable':
            return Response({
                "error": "Cannot change status to unavailable when there are active or reserved bookings",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RoomSerializer(room, data=filtered_data, partial=True)
    else:
        serializer = RoomSerializer(room, data=request.data, partial=True)
    
    if serializer.is_valid():
        instance = serializer.save()
        data = RoomSerializer(instance).data
        
        message = "Room updated successfully"
        if has_active_bookings:
            message += " (Note: Some fields cannot be edited due to active bookings)"
        
        return Response({
            "message": message,
            "data": data
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            "error": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_room(request, room_id):
    try:
        room = Rooms.objects.get(id=room_id)        
        active_bookings = Bookings.objects.filter(
            room=room,
            status__in=['reserved', 'confirmed', 'checked_in']
        ).exists()
        
        if active_bookings:
            return Response({
                "error": "Cannot delete room with active or reserved bookings",
                "message": "This room has active or reserved bookings and cannot be deleted."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        room.delete()
        return Response({
            "message": "Room deleted successfully"
        }, status=status.HTTP_200_OK)
    except Rooms.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Areas
@api_view(['GET'])
def fetch_areas(request):
    try:
        areas = Areas.objects.all().order_by('-id')
        
        # Get pagination parameters
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 9)
        
        # Create paginator
        paginator = Paginator(areas, page_size)
        
        try:
            paginated_areas = paginator.page(page)
        except PageNotAnInteger:
            paginated_areas = paginator.page(1)
        except EmptyPage:
            paginated_areas = paginator.page(paginator.num_pages)
        
        serializer = AreaSerializer(paginated_areas, many=True)
        
        return Response({
            "data": serializer.data,
            "pagination": {
                "total_pages": paginator.num_pages,
                "current_page": int(page),
                "total_items": paginator.count,
                "page_size": int(page_size)
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_new_area(request):
    try:
        serializer = AreaSerializer(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            data = AreaSerializer(instance).data
            return Response({
                "message": "Area added successfully",
                "data": data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def show_area_details(request, area_id):
    try:
        area = Areas.objects.get(id=area_id)
        serializer = AreaSerializer(area)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Areas.DoesNotExist:
        return Response({
            "error": "Area not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_area(request, area_id):
    try:
        area = Areas.objects.get(id=area_id)
    except Areas.DoesNotExist:
        return Response({
            "error": "Area not found"
        }, status=status.HTTP_404_NOT_FOUND)
    
    has_active_bookings = Bookings.objects.filter(
        area=area,
        status__in=['reserved', 'confirmed', 'checked_in']
    ).exists()
    
    if has_active_bookings:
        allowed_fields = ['description', 'amenities', 'status']
        filtered_data = {k: v for k, v in request.data.items() if k in allowed_fields}    
        if 'status' in filtered_data and filtered_data['status'] == 'unavailable':
            return Response({
                "error": "Cannot change status to unavailable when there are active or reserved bookings",
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AreaSerializer(area, data=filtered_data, partial=True)
    else:
        serializer = AreaSerializer(area, data=request.data, partial=True)
    
    if serializer.is_valid():
        instance = serializer.save()
        data = AreaSerializer(instance).data
        
        message = "Area updated successfully"
        if has_active_bookings:
            message += " (Note: Some fields cannot be edited due to active bookings)"
        
        return Response({
            "message": message,
            "data": data
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            "error": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_area(request, area_id):
    try:
        area = Areas.objects.get(id=area_id)
        
        active_bookings = Bookings.objects.filter(
            area=area,
            status__in=['reserved', 'confirmed', 'checked_in']
        ).exists()
        
        if active_bookings:
            return Response({
                "error": "Cannot delete area with active or reserved bookings",
                "message": "This area has active or reserved bookings and cannot be deleted."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        area.delete()
        return Response({
            "message": "Area deleted successfully"
        }, status=status.HTTP_200_OK)
    except Areas.DoesNotExist:
        return Response({
            "error": "Area not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# CRUD Amenities
@api_view(['GET'])
def fetch_amenities(request):
    try:
        amenities = Amenities.objects.all().order_by('id')
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 15)
        
        paginator = Paginator(amenities, page_size)
        try:
            amenities_page = paginator.page(page)
        except PageNotAnInteger:
            amenities_page = paginator.page(1)
        except EmptyPage:
            amenities_page = paginator.page(paginator.num_pages)
        serializer = AmenitySerializer(amenities_page, many=True)
        return Response({
            "data": serializer.data,
            "page": amenities_page.number,
            "pages": paginator.num_pages,
            "total": paginator.count
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_amenity(request):
    try:
        serializer = AmenitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Amenity added successfully"
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except ValidationError as ve:
        return Response({
            "error": str(ve)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def retreive_amenity(request, pk):
    try:
        amenity = Amenities.objects.get(pk=pk)
        serializer = AmenitySerializer(amenity)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Amenities.DoesNotExist:
        return Response({
            "error": "Amenity not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_amenity(request, pk):
    try:
        amenity = Amenities.objects.get(pk=pk)
    except Amenities.DoesNotExist:
        return Response({
            "error": "Amenity not found"
        }, status=status.HTTP_404_NOT_FOUND)
    try:
        serializer = AmenitySerializer(amenity, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Amenity updated successfully"
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except ValidationError as ve:
        return Response({
            "error": str(ve)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_amenity(request, pk):
    try:
        amenity = Amenities.objects.get(pk=pk)
        amenity.delete()
        return Response({
            "message": "Amenity deleted successfully"
        }, status=status.HTTP_200_OK)
    except Amenities.DoesNotExist:
        return Response({
            "error": "Amenity not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# CRUD Users
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_all_users(request):
    try:
        users = CustomUsers.objects.filter(role="guest")
        serializer = CustomUserSerializer(users, many=True)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_new_user(request):
    try:
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')
        
        if not all([first_name, last_name, email, password, confirm_password]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
        
        if CustomUsers.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = CustomUsers.objects.create_user(
            username=email,
            email=email, 
            first_name=first_name, 
            last_name=last_name, 
            password=password, 
            is_staff=True
        )
        user.save()
        
        serializer = CustomUserSerializer(user)
        
        return Response({
            "message": "Staff added successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def show_user_details(request, user_id):
    try:
        user = CustomUsers.objects.get(id=user_id, is_staff=True)
        serializer = CustomUserSerializer(user)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except CustomUsers.DoesNotExist:
        return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_user(request, user_id):
    try:
        user = CustomUsers.objects.filter(role="guest").get(id=user_id)
    except CustomUsers.DoesNotExist:
        return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)
    try:
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Staff updated successfully"
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def archive_user(request, user_id):
    try:
        user = CustomUsers.objects.get(id=user_id, is_staff=True)
        user.is_staff = False
        user.save()
        return Response({
            "message": "Staff archived successfully"
        }, status=status.HTTP_200_OK)
    except CustomUsers.DoesNotExist:
        return Response({"error": "Staff not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_bookings(request):
    try:
        bookings = Bookings.objects.all().order_by('-created_at')
        
        # Get pagination parameters
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 9)
        
        # Create paginator
        paginator = Paginator(bookings, page_size)
        
        try:
            paginated_bookings = paginator.page(page)
        except PageNotAnInteger:
            paginated_bookings = paginator.page(1)
        except EmptyPage:
            paginated_bookings = paginator.page(paginator.num_pages)
        
        serializer = BookingSerializer(paginated_bookings, many=True)
        
        return Response({
            "data": serializer.data,
            "pagination": {
                "total_pages": paginator.num_pages,
                "current_page": int(page),
                "total_items": paginator.count,
                "page_size": int(page_size)
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_detail(request, booking_id):
    try:
        booking = Bookings.objects.get(id=booking_id)
        booking_serializer = BookingSerializer(booking)
        data = booking_serializer.data
        
        room_serializer = RoomSerializer(booking.room)
        data['room'] = room_serializer.data
        
        return Response({
            "data": data
        }, status=status.HTTP_200_OK)
    except Bookings.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_booking_status(request, booking_id):
    try:
        booking = Bookings.objects.get(id=booking_id)
    except Bookings.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    
    status_value = request.data.get('status')
    if not status_value:
            return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    valid_statuses = ['pending', 'reserved', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'rejected', 'missed_reservation']
    if status_value not in valid_statuses:
        return Response({"error": f"Invalid status value. Valid values are: {', '.join(valid_statuses)}"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
    if status_value == 'reserved' and booking.status != 'reserved':
        if booking.is_venue_booking and booking.area:
            area = booking.area
            area.status = 'reserved'
            area.save()
        elif booking.room:
            room = booking.room
            room.status = 'reserved'
            room.save()
    
    if status_value == 'checked_in' and booking.status != 'checked_in':
        if booking.is_venue_booking and booking.area:
            area = booking.area
            area.status = 'occupied'
            area.save()
        elif booking.room:
            room = booking.room
            room.status = 'occupied'
            room.save()

    if status_value == 'checked_out' and booking.status != 'checked_out':
        if booking.is_venue_booking and booking.area:
            area = booking.area
            area.status = 'available'
            area.save()
        elif booking.room:
            room = booking.room
            room.status = 'available'
            room.save()
    
    if status_value == 'missed_reservation' and booking.status != 'missed_reservation':
        if booking.is_venue_booking and booking.area:
            area = booking.area
            area.status = 'available'
            area.save()
        elif booking.room:
            room = booking.room
            room.status = 'available'
            room.save()
    
    if status_value == 'rejected':
        booking.cancellation_date = timezone.now()
        booking.cancellation_reason = request.data.get('reason', 'Rejected by admin/staff')
    
    previous_status = booking.status
    booking.status = status_value
    booking.save()
    
    serializer = BookingSerializer(booking)
    
    if status_value == 'reserved' and previous_status != 'reserved':
        try:
            from .email.booking import send_booking_confirmation_email
            
            user_email = booking.user.email
            
            email_sent = send_booking_confirmation_email(user_email, serializer.data)
            
            if email_sent:
                print(f"Confirmation email sent to {user_email} for booking {booking_id}")
            else:
                print(f"Failed to send confirmation email to {user_email} for booking {booking_id}")
                
        except Exception as e:
            print(f"Error while sending booking confirmation email: {str(e)}")
    
    # Send rejection email if the booking is rejected
    elif status_value == 'rejected' and previous_status != 'rejected':
        try:
            from .email.booking import send_booking_rejection_email
            
            user_email = booking.user.email
            
            email_sent = send_booking_rejection_email(user_email, serializer.data)
            
            if email_sent:
                print(f"Rejection email sent to {user_email} for booking {booking_id}")
            else:
                print(f"Failed to send rejection email to {user_email} for booking {booking_id}")
                
        except Exception as e:
            print(f"Error while sending booking rejection email: {str(e)}")

    if booking.status not in ['reserved', 'checked_in'] and (status_value == 'cancelled' or status_value == 'rejected'):
        if booking.is_venue_booking and booking.area:
            area = booking.area
            area.status = 'available'
            area.save()
        elif booking.room:
            room = booking.room
            room.status = 'available'
            room.save()
    
    return Response({
        "message": f"Booking status updated to {status_value}",
        "data": serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_payment(request, booking_id):
    try:
        booking = Bookings.objects.get(id=booking_id)
    except Bookings.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    
    amount = request.data.get('amount')
    transaction_type = request.data.get('transaction_type', 'booking')
    
    if not amount:
        return Response({"error": "Payment amount is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if isinstance(amount, str):
            amount = float(amount)
            
        booking.payment_status = 'paid'
        booking.save()
        
        transaction = Transactions.objects.create(
            booking=booking,
            user=booking.user,
            transaction_type=transaction_type,
            amount=amount,
            status='completed'
        )
        
        return Response({
            "message": "Payment recorded successfully",
            "transaction_id": transaction.id,
            "booking_id": booking.id,
            "amount": amount
        }, status=status.HTTP_201_CREATED)
        
    except ValueError:
        return Response({"error": "Invalid payment amount"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_status_counts(request):
    try:
        pending_count = Bookings.objects.filter(status='pending').count()
        reserved_count = Bookings.objects.filter(status='reserved').count()
        checked_in_count = Bookings.objects.filter(status='checked_in').count()
        checked_out_count = Bookings.objects.filter(status='checked_out').count()
        cancelled_count = Bookings.objects.filter(status='cancelled').count()
        no_show_count = Bookings.objects.filter(status='no_show').count() 
        rejected_count = Bookings.objects.filter(status='rejected').count()
        
        return Response({
            "pending": pending_count,
            "reserved": reserved_count,
            "checked_in": checked_in_count,
            "checked_out": checked_out_count,
            "cancelled": cancelled_count,
            "no_show": no_show_count,
            "rejected": rejected_count
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# CRUD Users (Regular accounts)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def fetch_all_users(request):
    try:
        users = CustomUsers.objects.filter(is_staff=False, is_superuser=False)
        serializer = CustomUserSerializer(users, many=True)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def show_user_details(request, user_id):
    try:
        user = CustomUsers.objects.get(id=user_id, is_staff=False, is_superuser=False)
        serializer = CustomUserSerializer(user)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except CustomUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_user(request, user_id):
    try:
        user = CustomUsers.objects.get(id=user_id, is_staff=False, is_superuser=False)
    except CustomUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    try:
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "User updated successfully"
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def archive_user(request, user_id):
    try:
        user = CustomUsers.objects.get(id=user_id, is_staff=False, is_superuser=False)
        user.is_active = False  # Instead of deleting, we deactivate the account
        user.save()
        return Response({
            "message": "User archived successfully"
        }, status=status.HTTP_200_OK)
    except CustomUsers.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)