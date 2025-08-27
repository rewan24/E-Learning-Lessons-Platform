from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from .serializers import UserSerializer
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken


# تسجيل مستخدم جديد (Public)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # نحذف الباسورد من الـ response
        data = serializer.data.copy()
        data.pop("password", None)

        # convenience: نرجع التوكن مع التسجيل
        refresh = RefreshToken.for_user(user)
        data["access"] = str(refresh.access_token)
        data["refresh"] = str(refresh)

        return Response(data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# قائمة كل المستخدمين (Admin فقط)
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def list_users(request):
    users = User.objects.all().order_by("id")
    paginator = PageNumberPagination()
    result_page = paginator.paginate_queryset(users, request)
    serializer = UserSerializer(result_page, many=True)

    return paginator.get_paginated_response(serializer.data)


# تفاصيل/تعديل/حذف مستخدم معين (Admin فقط)
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([permissions.IsAdminUser])
def user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    

# بروفايل المستخدم الحالي (Authenticated)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)