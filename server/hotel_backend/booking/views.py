from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Reservations, Bookings, Reviews
from property.models import Rooms, Areas
from property.serializers import AreaSerializer
from .serializers import (
    ReservationSerializer, 
    BookingSerializer, 
    BookingRequestSerializer,
    RoomSerializer,
    ReviewSerializer
)
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.db.models import Q
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage

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
        
    rooms = Rooms.objects.filter(status='available')
    areas = Areas.objects.filter(status='available')
    
    room_serializer = RoomSerializer(rooms, many=True, context={'request': request})
    area_serializer = AreaSerializer(areas, many=True)
    
    return Response({
        "rooms": room_serializer.data,
        "areas": area_serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bookings_list(request):
    try:
        if request.method == 'GET':
            bookings = Bookings.objects.all().order_by('-created_at').select_related('user', 'room', 'area')
            serializer = BookingSerializer(bookings, many=True)
            
            return Response({
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        elif request.method == 'POST':
            serializer = BookingRequestSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                booking = serializer.save()
                booking_data = BookingSerializer(booking).data
                
                return Response({
                    "id": booking.id,
                    "message": "Booking created successfully",
                    "data": booking_data
                }, status=status.HTTP_201_CREATED)
                
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
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
        
        if booking.is_venue_booking and booking.area:
            area_serializer = AreaSerializer(booking.area)
            data['area'] = area_serializer.data
        elif booking.room:
            room_serializer = RoomSerializer(booking.room)
            data['room'] = room_serializer.data
        
        if booking.valid_id:
            if hasattr(booking.valid_id, 'url'):
                data['valid_id'] = booking.valid_id.url
            else:
                data['valid_id'] = booking.valid_id
            
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
        bookings = Bookings.objects.filter(user=user).order_by('-created_at')
        
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 5)
        
        paginator = Paginator(bookings, page_size)
        
        try:
            paginated_bookings = paginator.page(page)
        except PageNotAnInteger:
            paginated_bookings = paginator.page(1)
        except EmptyPage:
            paginated_bookings = paginator.page(paginator.num_pages)
            
        booking_data = []
        for booking in paginated_bookings:
            booking_serializer = BookingSerializer(booking)
            data = booking_serializer.data
            
            if booking.is_venue_booking and booking.area:
                area_serializer = AreaSerializer(booking.area)
                data['area'] = area_serializer.data
            elif booking.room:
                room_serializer = RoomSerializer(booking.room)
                data['room'] = room_serializer.data
            
            if booking.valid_id:
                if hasattr(booking.valid_id, 'url'):
                    data['valid_id'] = booking.valid_id.url
                else:
                    data['valid_id'] = booking.valid_id
            
            booking_data.append(data)
        
        return Response({
            "data": booking_data,
            "pagination": {
                "total_pages": paginator.num_pages,
                "current_page": int(page),
                "total_items": paginator.count,
                "page_size": int(page_size)
            }
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    try:
        booking = Bookings.objects.get(id=booking_id)
    except Bookings.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.user.role == 'guest':
        if booking.user != request.user:
            return Response({"error": "You do not have permission to cancel this booking"},
                            status=status.HTTP_403_FORBIDDEN)
        if booking.status.lower() != 'pending':
            return Response({"error": "You can only cancel bookings that are pending"},
                            status=status.HTTP_400_BAD_REQUEST)
    else:
        if booking.status.lower() == 'cancelled':
            return Response({"error": "Booking is already cancelled"},
                            status=status.HTTP_400_BAD_REQUEST)

    reason = request.data.get('reason', '').strip()
    if not reason:
        return Response({"error": "A cancellation reason is required"},
                        status=status.HTTP_400_BAD_REQUEST)

    booking.status = 'cancelled'
    booking.cancellation_reason = reason
    booking.cancellation_date = timezone.now()
    booking.save()

    if booking.status.lower() == 'reserved':
        if booking.is_venue_booking and booking.area:
            booking.area.status = 'available'
            booking.area.save()
        elif booking.room:
            booking.room.status = 'available'
            booking.room.save()

    serializer = BookingSerializer(booking)
    return Response({
        "message": "Booking cancelled successfully",
        "data": serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def fetch_room_bookings(request, room_id):
    try:
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        query = Q(room_id=room_id) & ~Q(status__in=['cancelled', 'rejected'])

        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                end = datetime.strptime(end_date, "%Y-%m-%d")
                
                query = query & Q(check_in_date__lte=end) & Q(check_out_date__gte=start)
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, 
                               status=status.HTTP_400_BAD_REQUEST)
        
        bookings = Bookings.objects.filter(query)
        
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
    try:
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        query = Q(area_id=area_id) & ~Q(status__in=['cancelled', 'rejected'])
        
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                end = datetime.strptime(end_date, "%Y-%m-%d")
                
                query = query & Q(check_in_date__lte=end) & Q(check_out_date__gte=start)
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, 
                               status=status.HTTP_400_BAD_REQUEST)
        
        bookings = Bookings.objects.filter(query)
        
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

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def booking_reviews(request, booking_id):
    try:
        booking = Bookings.objects.get(id=booking_id)
    except Bookings.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if booking.user.id != request.user.id and not request.user.is_staff:
        return Response({"error": "You don't have permission to access these reviews"}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        reviews = Reviews.objects.filter(booking=booking)
        serializer = ReviewSerializer(reviews, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        if booking.status != 'checked_out':
            return Response({
                "error": "Reviews can only be submitted for checked-out bookings"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if Reviews.objects.filter(booking=booking, user=request.user).exists():
            return Response({
                "error": "You have already submitted a review for this booking"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data.copy()
        data['booking'] = booking_id
        
        serializer = ReviewSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Review submitted successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_reviews(request):
    reviews = Reviews.objects.filter(user=request.user).order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True)
    return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def review_detail(request, review_id):
    try:
        review = Reviews.objects.get(id=review_id)
    except Reviews.DoesNotExist:
        return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if review.user.id != request.user.id and not request.user.is_staff:
        return Response({"error": "You don't have permission to access this review"}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        serializer = ReviewSerializer(review)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        serializer = ReviewSerializer(review, data=request.data, partial=True, 
                                     context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        review.delete()
        return Response({"message": "Review deleted successfully"}, 
                       status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def room_reviews(request, room_id):
    try:
        room = Rooms.objects.get(id=room_id)
        
        bookings = Bookings.objects.filter(room=room, is_venue_booking=False)
        booking_ids = [booking.id for booking in bookings]
        
        reviews = Reviews.objects.filter(booking_id__in=booking_ids).order_by('-created_at')
        
        serializer = ReviewSerializer(reviews, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    except Rooms.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def area_reviews(request, area_id):
    try:
        area = Areas.objects.get(id=area_id)
        
        bookings = Bookings.objects.filter(area=area, is_venue_booking=True)
        booking_ids = [booking.id for booking in bookings]
        
        reviews = Reviews.objects.filter(booking_id__in=booking_ids).order_by('-created_at')
        
        serializer = ReviewSerializer(reviews, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)
    
    except Areas.DoesNotExist:
        return Response({"error": "Area not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
