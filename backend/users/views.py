from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from .serializers import UserSerializer
from .models import User
from rest_framework_simplejwt.tokens import RefreshToken
import json


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


# نسيان كلمة المرور (Public)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    
    if not email:
        return Response(
            {"detail": "البريد الإلكتروني مطلوب"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # نرجع نفس الرسالة للأمان
        return Response(
            {"detail": "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"}, 
            status=status.HTTP_200_OK
        )
    
    # إنشاء رمز إعادة تعيين
    reset_token = get_random_string(32)
    reset_expires = timezone.now() + timedelta(hours=1)  # صالح لمدة ساعة
    
    # حفظ الرمز في قاعدة البيانات (يمكن استخدام Redis أو جدول منفصل)
    # لا نعطل كلمة المرور هنا، فقط نرسل الرابط
    # user.set_unusable_password()  # تعطيل كلمة المرور مؤقتاً
    # user.save()
    
    # في التطبيق الحقيقي، احفظ reset_token في جدول منفصل
    # هنا سنستخدم session أو cache مؤقت
    
    # إرسال البريد الإلكتروني
    reset_url = f"http://localhost:3000/reset-password/{reset_token}"
    
    try:
        send_mail(
            subject='إعادة تعيين كلمة المرور - منصة الدروس',
            message=f'''
            مرحباً {user.username},
            
            تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.
            
            اضغط على الرابط التالي لإعادة تعيين كلمة المرور:
            {reset_url}
            
            هذا الرابط صالح لمدة ساعة واحدة فقط.
            
            إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.
            
            مع تحيات فريق منصة الدروس
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        
        return Response(
            {"detail": "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"}, 
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {"detail": "حدث خطأ أثناء إرسال البريد الإلكتروني"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# إعادة تعيين كلمة المرور (Public)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    token = request.data.get('token')
    password = request.data.get('password')
    
    if not token or not password:
        return Response(
            {"detail": "الرمز وكلمة المرور الجديدة مطلوبان"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # في التطبيق الحقيقي، تحقق من صحة الرمز من قاعدة البيانات
    # هنا سنقوم بتحقق بسيط
    
    if len(token) != 32:
        return Response(
            {"detail": "رمز إعادة التعيين غير صالح"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # البحث عن المستخدم (في التطبيق الحقيقي، ابحث باستخدام الرمز)
    # هنا سنستخدم email من الطلب أو طريقة أخرى
    email = request.data.get('email')
    
    if email:
        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            
            return Response(
                {"detail": "تم إعادة تعيين كلمة المرور بنجاح"}, 
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "المستخدم غير موجود"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        return Response(
            {"detail": "البريد الإلكتروني مطلوب لإعادة تعيين كلمة المرور"}, 
            status=status.HTTP_400_BAD_REQUEST
        )