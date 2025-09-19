from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Booking
from .serializers import BookingSerializer
from groups.models import Group
from students.models import Student

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def booking_list_create(request):
    """
    GET: قائمة بحجوزات المستخدم
    POST: إنشاء حجز جديد
    """
    if request.method == 'GET':
        # Check if filtering by specific student ID
        student_id = request.query_params.get('student')
        
        if student_id:
            # Admin or public access to specific student's bookings
            try:
                student = Student.objects.get(id=student_id)
                bookings = Booking.objects.filter(student=student)
                serializer = BookingSerializer(bookings, many=True)
                return Response(serializer.data)
            except Student.DoesNotExist:
                return Response(
                    {"error": "الطالب غير موجود"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Get current user's bookings
            try:
                student = request.user.student
                bookings = Booking.objects.filter(student=student)
                serializer = BookingSerializer(bookings, many=True)
                return Response(serializer.data)
            except Student.DoesNotExist:
                return Response(
                    {"error": "لا يوجد طالب مرتبط بحسابك"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
    
    elif request.method == 'POST':
        serializer = BookingSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def booking_detail(request, pk):
    """
    GET: تفاصيل حجز محدد
    DELETE: حذف حجز
    """
    try:
        booking = Booking.objects.get(pk=pk)
        if booking.student.user != request.user:
            return Response(
                {"error": "ليس لديك صلاحية للوصول إلى هذا الحجز"},
                status=status.HTTP_403_FORBIDDEN
            )
    except Booking.DoesNotExist:
        return Response(
            {"error": "الحجز غير موجود"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = BookingSerializer(booking)
        return Response(serializer.data)
    
    elif request.method == 'DELETE':
        booking.delete()
        return Response(
            {"message": "تم إلغاء الحجز بنجاح"}, 
            status=status.HTTP_200_OK
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_group(request, group_id):
    """
    الانضمام إلى مجموعة (إنشاء حجز)
    """
    group = get_object_or_404(Group, id=group_id)

    try:
        student = request.user.student
    except Student.DoesNotExist:
        return Response(
            {"error": "لا يوجد طالب مرتبط بحسابك"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    if group.is_full:
        return Response({"error": "هذه المجموعة مكتملة"}, status=status.HTTP_400_BAD_REQUEST)

    if Booking.objects.filter(student=student, group=group).exists():
        return Response({"error": "أنت بالفعل عضو في هذه المجموعة"}, status=status.HTTP_400_BAD_REQUEST)

    booking = Booking.objects.create(student=student, group=group)
    serializer = BookingSerializer(booking)
    
    return Response({
        "message": "تم الانضمام إلى المجموعة بنجاح",
        "booking": serializer.data
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_group(request, group_id):
    """
    مغادرة مجموعة (حذف الحجز)
    """
    group = get_object_or_404(Group, id=group_id)
    
    try:
        student = request.user.student
    except Student.DoesNotExist:
        return Response(
            {"error": "لا يوجد طالب مرتبط بحسابك"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    booking = Booking.objects.filter(student=student, group=group).first()
    if booking:
        booking.delete()
        return Response({"message": "تم مغادرة المجموعة بنجاح"}, status=status.HTTP_200_OK)
    return Response({"error": "أنت لست عضوًا في هذه المجموعة"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """دالة قديمة لإنشاء حجز - يمكن استخدام booking_list_create بدلاً منها"""
    serializer = BookingSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_bookings(request):
    """دالة قديمة لعرض الحجوزات - يمكن استخدام booking_list_create بدلاً منها"""
    try:
        student = request.user.student
        bookings = Booking.objects.filter(student=student)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response(
            {"error": "لا يوجد طالب مرتبط بحسابك"}, 
            status=status.HTTP_400_BAD_REQUEST
        )