from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Booking
from .serializers import BookingSerializer, CreateBookingSerializer
from students.models import Student
from groups.models import Group

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_booking(request):
    serializer = CreateBookingSerializer(data=request.data)
    if serializer.is_valid():
        student = Student.objects.get(id=serializer.validated_data['student_id'])
        group = Group.objects.get(id=serializer.validated_data['group_id'])

        if group.students.count() >= group.capacity:
            return Response({"error": "المجموعة امتلأت"}, status=status.HTTP_400_BAD_REQUEST)

        if Booking.objects.filter(student=student, group=group).exists():
            return Response({"error": "لقد قمت بالحجز في هذه المجموعة بالفعل"}, status=status.HTTP_400_BAD_REQUEST)

        booking = Booking(student=student, group=group)
        booking.save()
        group.students.add(student)
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_bookings(request):
    bookings = Booking.objects.all()
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)
