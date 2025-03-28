from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Reservations, Bookings
from property.models import Rooms, Areas
from property.serializers import AreaSerializer
from .serializers import (
    ReservationSerializer, 
    BookingSerializer, 
    BookingRequestSerializer,
    RoomSerializer
)
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timezone
from django.db.models import Q

# Create your views here.
@api_view(['GET'])
def fetch_availability(request):
    arrival_date = request.query_params.get('arrival') or request.data.get('arrival')
    departure_date = request.query_params.get('departure') or request.data.get('departure')
    
    if not arrival_date or not departure_date:
        return Response({
            "error": "Please provide both arrival and departure dates"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        arrival = datetime.strptime(arrival_date, "%Y-%m-%d")
        departure = datetime.strptime(departure_date, "%Y-%m-%d")
    except ValueError:
        return Response({
            "error": "Invalid date format. Use YYYY-MM-DD"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if departure <= arrival:
        return Response({
            'error': "Departure date should be greater than arrival date"
        }, status=status.HTTP_400_BAD_REQUEST)
        
    available_rooms = Rooms.objects.filter(status='available')
    available_areas = Areas.objects.filter(status='available')
    
    room_serializer = RoomSerializer(available_rooms, many=True, context={'request': request})
    area_serializer = AreaSerializer(available_areas, many=True)
    
    return Response({
        "rooms": room_serializer.data,
        "areas": area_serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bookings_list(request):
    try:
        if request.method == 'GET':
            print(f"Fetching all bookings, user: {request.user.email}")
            bookings = Bookings.objects.all().order_by('-created_at').select_related('user', 'room', 'area')
            
            # Log valid_id URLs for debugging
            for booking in bookings:
                print(f"Booking {booking.id} - Valid ID URL: {booking.valid_id.url if booking.valid_id else None}")
                print(f"Booking {booking.id} - Is Venue Booking: {booking.is_venue_booking}")
                if booking.is_venue_booking:
                    print(f"Venue booking area: {booking.area.area_name if booking.area else 'No area'}")
                else:
                    print(f"Room booking room: {booking.room.room_name if booking.room else 'No room'}")
            
            serializer = BookingSerializer(bookings, many=True)
            
            # Debug the serialized data
            for booking_data in serializer.data:
                print(f"Serialized booking {booking_data.get('id')} - Valid ID: {booking_data.get('valid_id')}")
            
            return Response({
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        elif request.method == 'POST':
            print(f"Creating booking for authenticated user: {request.user.username} (ID: {request.user.id})")
            serializer = BookingRequestSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                booking = serializer.save()
                booking_data = BookingSerializer(booking).data
                
                # Debug the created booking
                print(f"Booking created successfully for user ID: {booking.user.id}")
                print(f"Booking valid_id: {booking.valid_id}")
                print(f"Is venue booking: {booking.is_venue_booking}")
                
                return Response({
                    "id": booking.id,
                    "message": "Booking created successfully",
                    "data": booking_data
                }, status=status.HTTP_201_CREATED)
                
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Error in bookings_list: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def booking_detail(request, booking_id):
    try:
        booking = Bookings.objects.get(id=booking_id)
        print(f"Accessing booking detail for ID: {booking_id}")
        
        # Log the valid_id URL for debugging
        print(f"Valid ID URL for booking {booking_id}: {booking.valid_id.url if booking.valid_id else None}")
        print(f"Is venue booking: {booking.is_venue_booking}")
    except Bookings.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        booking_serializer = BookingSerializer(booking)
        data = booking_serializer.data
        
        # Debug the serialized data
        print(f"Serialized booking {booking_id} - Valid ID: {data.get('valid_id')}")
        
        # Add room or area details based on booking type
        if booking.is_venue_booking and booking.area:
            area_serializer = AreaSerializer(booking.area)
            data['area'] = area_serializer.data
            print(f"Added area details for venue booking")
        elif booking.room:
            room_serializer = RoomSerializer(booking.room)
            data['room'] = room_serializer.data
            print(f"Added room details for regular booking")
        
        return Response({
            "data": data
        }, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = BookingSerializer(booking, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            "error": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        booking.delete()
        return Response({
            "message": "Booking deleted successfully"
        }, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def reservation_list(request):
    try:
        if request.method == 'GET':
            reservations = Reservations.objects.all()
            serializer = ReservationSerializer(reservations, many=True)
            return Response({
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        elif request.method == 'POST':
            serializer = ReservationSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def reservation_detail(request, reservation_id):
    try:
        reservation = Reservations.objects.get(id=reservation_id)
    except Reservations.DoesNotExist:
        return Response({"error": "Reservation not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = ReservationSerializer(reservation)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ReservationSerializer(reservation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({
            "error": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        reservation.delete()
        return Response({
            "message": "Reservation deleted successfully"
        }, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def area_reservations(request):
    try:
        if request.method == 'GET':
            reservations = Reservations.objects.all().order_by('-created_at')
            serializer = ReservationSerializer(reservations, many=True)
            return Response({
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        elif request.method == 'POST':
            serializer = ReservationSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def area_detail(request, area_id):
    try:
        area = Areas.objects.get(id=area_id)
        serializer = AreaSerializer(area)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Areas.DoesNotExist:
        return Response({"error": "Area not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def room_detail(request, room_id):
    try:
        room = Rooms.objects.get(id=room_id)
        serializer = RoomSerializer(room, context={'request': request})
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Rooms.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_bookings(request):
    try:
        user = request.user
        print(f"Fetching bookings for user: {user.id} - {user.email}")
        bookings = Bookings.objects.filter(user=user).order_by('-created_at')
        
        # Create a list of booking data with the related room/area info
        booking_data = []
        for booking in bookings:
            # Get booking details using the serializer
            booking_serializer = BookingSerializer(booking)
            data = booking_serializer.data
            
            # Add specific details based on booking type
            if booking.is_venue_booking and booking.area:
                area_serializer = AreaSerializer(booking.area)
                data['area'] = area_serializer.data
                print(f"Added venue details for booking {booking.id}")
            elif booking.room:
                room_serializer = RoomSerializer(booking.room)
                data['room'] = room_serializer.data
                print(f"Added room details for booking {booking.id}")
            
            # Debug output
            print(f"Booking ID: {booking.id}, Valid ID: {booking.valid_id}")
            
            # Ensure valid_id is included
            if booking.valid_id:
                data['valid_id'] = booking.valid_id.url
                print(f"Added valid_id URL: {data['valid_id']}")
            
            booking_data.append(data)
        
        return Response({
            "data": booking_data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error in user_bookings: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    try:
        booking = Bookings.objects.get(id=booking_id)
        
        # Check if the booking belongs to the user or if admin/staff
        if booking.user.id != request.user.id and request.user.role not in ['admin', 'staff']:
            return Response({
                "error": "You do not have permission to cancel this booking"
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if the booking can be cancelled
        if booking.status in ['cancelled', 'checked_out', 'no_show', 'rejected']:
            return Response({
                "error": f"Cannot cancel a booking with status '{booking.status}'"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        reason = request.data.get('reason', '')
        if not reason:
            return Response({
                "error": "A reason for cancellation is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update booking status and add cancellation info
        previous_status = booking.status
        booking.status = 'cancelled'
        booking.cancellation_reason = reason
        booking.cancellation_date = timezone.now()
        booking.save()
        
        # Free up the room or area if it was reserved
        if previous_status == 'reserved':
            if booking.is_venue_booking and booking.area:
                area = booking.area
                area.status = 'available'
                area.save()
            elif booking.room:
                room = booking.room
                room.status = 'available'
                room.save()
        
        # Serialize and return the updated booking
        serializer = BookingSerializer(booking)
        
        return Response({
            "message": "Booking cancelled successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Bookings.DoesNotExist:
        return Response({
            "error": "Booking not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def fetch_room_bookings(request, room_id):
    """
    Get all bookings for a specific room to check availability
    """
    try:
        # Get date range from request if provided (optional)
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Basic query to get bookings for this room
        query = Q(room_id=room_id) & ~Q(status__in=['cancelled', 'rejected'])
        
        # Add date filtering if provided
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                end = datetime.strptime(end_date, "%Y-%m-%d")
                
                # Find all bookings that overlap with the requested date range
                # A booking overlaps if:
                # - check_in_date <= end_date AND check_out_date >= start_date
                query = query & Q(check_in_date__lte=end) & Q(check_out_date__gte=start)
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, 
                               status=status.HTTP_400_BAD_REQUEST)
        
        # Get the bookings
        bookings = Bookings.objects.filter(query)
        
        # Format the response with the dates and status
        booking_data = []
        for booking in bookings:
            booking_data.append({
                'id': booking.id,
                'check_in_date': booking.check_in_date,
                'check_out_date': booking.check_out_date,
                'status': booking.status
            })
        
        return Response({
            "data": booking_data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def fetch_area_bookings(request, area_id):
    """
    Get all bookings for a specific area to check availability
    """
    try:
        # Get date range from request if provided (optional)
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Basic query to get bookings for this area
        query = Q(area_id=area_id) & ~Q(status__in=['cancelled', 'rejected'])
        
        # Add date filtering if provided
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                end = datetime.strptime(end_date, "%Y-%m-%d")
                
                # Find all bookings that overlap with the requested date range
                query = query & Q(check_in_date__lte=end) & Q(check_out_date__gte=start)
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, 
                               status=status.HTTP_400_BAD_REQUEST)
        
        # Get the bookings
        bookings = Bookings.objects.filter(query)
        
        # Format the response with the dates and status
        booking_data = []
        for booking in bookings:
            booking_data.append({
                'id': booking.id,
                'check_in_date': booking.check_in_date,
                'check_out_date': booking.check_out_date,
                'status': booking.status,
                'start_time': booking.start_time,
                'end_time': booking.end_time
            })
        
        return Response({
            "data": booking_data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
