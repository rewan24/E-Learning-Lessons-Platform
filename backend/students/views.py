from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Student
from .serializers import StudentSerializer

# List Students (with search, ordering, pagination)
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def student_list(request):
    students = Student.objects.all()
    search = request.query_params.get("search")
    if search:
        students = students.filter(
            Q(full_name__icontains=search) |
            Q(email__icontains=search) |
            Q(phone__icontains=search) |
            Q(notes__icontains=search)
            )
    ordering = request.query_params.get("ordering")
    if ordering:
        students = students.order_by(ordering)
    paginator = PageNumberPagination()
    paginated_students = paginator.paginate_queryset(students, request)
    serializer = StudentSerializer(paginated_students, many=True)
    return paginator.get_paginated_response(serializer.data)


# Create Student (linked to request.user)
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def student_create(request):
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user) # Associate the student with the authenticated user
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Retrieve / Update / Delete Student
@api_view(["GET", "PUT", "DELETE"])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def student_detail(request, pk):
    student = get_object_or_404(Student, pk=pk)

    # 🛡 Authorization check
    if request.method in ["PUT", "DELETE"]:
        if student.user and student.user != request.user and not request.user.is_staff:
            return Response({"detail": "غير مسموح"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        serializer = StudentSerializer(student)
        return Response(serializer.data)

    elif request.method == "PUT":
        serializer = StudentSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        student.delete()
        return Response({"message": "تم حذف الطالب بنجاح"}, status=status.HTTP_204_NO_CONTENT)
    