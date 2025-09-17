from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register_user, list_users, user_detail, me, forgot_password, reset_password

app_name = "users"

urlpatterns = [
    path("register/", register_user, name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", me, name="me"),
    path("forgot-password/", forgot_password, name="forgot-password"),
    path("reset-password/", reset_password, name="reset-password"),
    path("", list_users, name="list-users"),
    path("<int:pk>/", user_detail, name="user-detail"),
]
