from django.urls import path
from .views import create_booking, list_bookings

app_name = "bookings"

urlpatterns = [
    path("", list_bookings, name="booking-list"),
    path("create/", create_booking, name="booking-create"),
]
