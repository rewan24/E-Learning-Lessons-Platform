from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Booking
from .serializers import BookingSerializer
from groups.models import Group


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    serializer = BookingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(student=request.user.student)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_booking(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id, student=request.user.student)
    booking.delete()
    return Response({"message": "تم إلغاء الحجز بنجاح"}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_group(request, group_id):
    group = get_object_or_404(Group, id=group_id)

    # التحقق من السعة
    if group.capacity <= group.bookings.count():
        return Response({"message": "هذه المجموعة مكتملة"}, status=status.HTTP_400_BAD_REQUEST)

    booking, created = Booking.objects.get_or_create(student=request.user.student, group=group)
    if created:
        return Response({"message": "تم الانضمام إلى المجموعة بنجاح"}, status=status.HTTP_201_CREATED)
    return Response({"message": "أنت بالفعل عضو في هذه المجموعة"}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_group(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    booking = Booking.objects.filter(student=request.user.student, group=group).first()
    if booking:
        booking.delete()
        return Response({"message": "تم مغادرة المجموعة بنجاح"}, status=status.HTTP_200_OK)
    return Response({"message": "أنت لست عضوًا في هذه المجموعة"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_bookings(request):
    bookings = Booking.objects.filter(student=request.user.student)
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def retrieve_booking(request, pk):
    booking = get_object_or_404(Booking, pk=pk, student=request.user.student)
    serializer = BookingSerializer(booking)
    return Response(serializer.data)


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_booking(request, pk):
    booking = get_object_or_404(Booking, pk=pk, student=request.user.student)
    serializer = BookingSerializer(booking, data=request.data, partial=True)  # partial=True عشان PATCH
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

