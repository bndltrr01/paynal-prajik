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
from datetime import datetime

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
            if request.user.is_authenticated:
                bookings = Bookings.objects.all().order_by('-created_at')
                serializer = BookingSerializer(bookings, many=True)
                return Response({
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        elif request.method == 'POST':
            print(f"Creating booking for authenticated user: {request.user.username} (ID: {request.user.id})")
            serializer = BookingRequestSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                booking = serializer.save()
                booking_data = BookingSerializer(booking).data
                print(f"Booking created successfully for user ID: {booking.user.id}")
                return Response({
                    "id": booking.id,
                    "message": "Booking created successfully",
                    "data": booking_data
                }, status=status.HTTP_201_CREATED)
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Error creating booking: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def booking_detail(request, booking_id):
    try:
        booking = Bookings.objects.get(id=booking_id)
    except Bookings.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        booking_serializer = BookingSerializer(booking)
        data = booking_serializer.data
        
        room_serializer = RoomSerializer(booking.room)
        data['room'] = room_serializer.data
        
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
        bookings = Bookings.objects.filter(user=user).order_by('-created_at')
        
        # Create a list of booking data with the related room info
        booking_data = []
        for booking in bookings:
            # Get room details
            room = booking.room
            room_serializer = RoomSerializer(room)
            
            # Create booking data
            booking_serializer = BookingSerializer(booking)
            data = booking_serializer.data
            data['room'] = room_serializer.data
            
            booking_data.append(data)
        
        return Response({
            "data": booking_data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    try:
        booking = Bookings.objects.get(id=booking_id)
        
        if booking.user != request.user:
            return Response({"error": "You can only cancel your own bookings"}, status=status.HTTP_403_FORBIDDEN)
        
        if booking.status not in ['pending', 'confirmed']:
            return Response({
                "error": f"Cannot cancel booking with status: {booking.status}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        reason = request.data.get('reason', '')
        
        booking.status = 'cancelled'
        booking.cancellation_reason = reason
        booking.cancellation_date = datetime.now().date()
        booking.save()
        
        return Response({
            "message": "Booking cancelled successfully",
            "booking_id": booking_id
        }, status=status.HTTP_200_OK)
        
    except Bookings.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
