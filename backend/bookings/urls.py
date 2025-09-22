from django.urls import path
from . import views

app_name = "bookings"

urlpatterns = [
    path("", views.booking_list_create, name="booking-list-create"),
    path("<int:pk>/", views.booking_detail, name="booking-detail"),
    path("group/<int:group_id>/join/", views.join_group, name="join-group"),
    path("group/<int:group_id>/leave/", views.leave_group, name="leave-group"),
    path("admin/", views.admin_bookings_list, name="admin-bookings-list")
]