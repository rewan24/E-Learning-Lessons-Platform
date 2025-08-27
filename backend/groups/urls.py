from django.urls import path
from . import views

app_name = "groups"

urlpatterns = [
    path("", views.group_list, name="group-list"),
    path("create/", views.group_create, name="group-create"),
    path("<int:pk>/", views.group_detail, name="group-detail"),
]
