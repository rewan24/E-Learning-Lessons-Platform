# from django.urls import path
# from . import views

# app_name = "students"

# urlpatterns = [
#     path("", views.student_list, name="student-list"),          # GET list
#     path("create/", views.student_create, name="student-create"), # POST create
#     path("<int:pk>/", views.student_detail, name="student-detail"), # GET/PUT/DELETE
# ]

from django.urls import path
from .views import student_list, student_create, student_detail

app_name = "students"

urlpatterns = [
    path("", student_list, name="student-list"),
    path("create/", student_create, name="student-create"),
    path("<int:pk>/", student_detail, name="student-detail"),
]
