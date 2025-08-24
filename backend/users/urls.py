# from django.urls import path
# from .views import create_user, list_users, user_detail

# app_name = "users"

# urlpatterns = [
#     path("", list_users, name="user-list"),  
#     path("create/", create_user, name="user-create"),  
#     path("<int:pk>/", user_detail, name="user-detail"),  
# ]

from django.urls import path
from .views import register_user, list_users

app_name = "users"

urlpatterns = [
    path("register/", register_user, name="register"),
    path("", list_users, name="list-users"),
]
