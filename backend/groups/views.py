from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from .models import Group
from .serializers import GroupSerializer

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def group_list(request):
    qs = Group.objects.all()

    # search بالاسم
    search = request.query_params.get("search")
    if search:
        qs = qs.filter(name__icontains=search)

    # filter بالمرحلة
    stage = request.query_params.get("stage")
    if stage:
        qs = qs.filter(stage=stage)

    # ordering بالبارام أو الافتراضي
    ordering = request.query_params.get("ordering")
    qs = qs.order_by(ordering or "-created_at")

    # Pagination
    paginator = PageNumberPagination()
    result_page = paginator.paginate_queryset(qs, request)
    serializer = GroupSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)    

@api_view(["POST"])
@permission_classes([permissions.IsAdminUser])
def group_create(request):
    serializer = GroupSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([permissions.AllowAny])
def group_detail(request, pk):
    try:
        group = Group.objects.get(pk=pk)
    except Group.DoesNotExist:
        return Response({"error": "Group not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = GroupSerializer(group)
        return Response(serializer.data)

    elif request.method == "PUT":
        if not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        serializer = GroupSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            # لو عايز يعدل السعة لازم تتحقق من العدد الحالي
            new_capacity = serializer.validated_data.get("capacity", group.capacity)
            if new_capacity < group.students.count():
                return Response(
                    {"error": "Capacity cannot be less than current number of students"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        if not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)