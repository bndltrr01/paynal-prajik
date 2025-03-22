from django.utils import timezone
from django.db.models import Count, Sum
from .models import AdminDetails
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from booking.models import *
from user_roles.serializers import CustomUserSerializer
from user_roles.models import CustomUsers
from property.models import Rooms, Amenities, Areas
from property.serializers import RoomSerializer, AmenitySerializer, AreaSerializer
from property.utils import generate_room_number
from .validations.manage_rooms import validate_room_data
from rest_framework.exceptions import ValidationError

# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_details(request):
    try:
        admin_details = AdminDetails.objects.get(email="admin@gmail.com")
    except AdminDetails.DoesNotExist:
        return Response({"error": "Admin not found"}, status=status.HTTP_404_NOT_FOUND)
    
    data = {
        "name": admin_details.name,
        "email": admin_details.email,
        "profile_pic": admin_details.profile_pic.url if admin_details.profile_pic else None
    }
    
    return Response({
        'data': data
    }, status=status.HTTP_200_OK)

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
        
        return Response({
            "active_bookings": active_bookings,
            "available_rooms": available_rooms,
            "occupied_rooms": occupied_rooms,
            "maintenance_rooms": maintenance_rooms,
            "upcoming_reservations": upcoming_reservations,
            "revenue": float(revenue)
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
@permission_classes([IsAuthenticated])
def fetch_rooms(request):
    try:
        rooms = Rooms.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_new_room(request):
    try:
        validated_data = validate_room_data(request.data)
    except ValidationError as e:
        return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)
    try:
        serializer = RoomSerializer(data=validated_data)
        if serializer.is_valid():
            instance = serializer.save(room_number=generate_room_number())
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
    try:
        validated_data = validate_room_data(request.data)
    except ValidationError as err:
        return Response({"error": err.detail}, status=status.HTTP_400_BAD_REQUEST)
    try:
        serializer = RoomSerializer(room, data=validated_data, partial=True)
        if serializer.is_valid():
            instance = serializer.save()
            data = RoomSerializer(instance).data
            return Response({
                "message": "Room updated successfully",
                "data": data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_room(request, room_id):
    try:
        room = Rooms.objects.get(id=room_id)
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
@permission_classes([IsAuthenticated])
def fetch_areas(request):
    try:
        areas = Areas.objects.all()
        serializer = AreaSerializer(areas, many=True)
        return Response({
            "data": serializer.data
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
    try:
        serializer = AreaSerializer(area, data=request.data, partial=True)
        if serializer.is_valid():
            instance = serializer.save()
            data = AreaSerializer(instance).data
            return Response({
                "message": "Area updated successfully",
                "data": data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "error": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_area(request,area_id):
    try:
        area = Areas.objects.get(id=area_id)
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manage_users(request):
    try:
        users = CustomUsers.objects.filter(is_admin=False)
        serializer = CustomUserSerializer(users, many=True)
        return Response({
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)