from django.urls import path
from . import views

app_name = "bookings"

urlpatterns = [
    path("", views.list_bookings, name="booking-list"),           # GET → عرض كل الحجوزات (ممكن للأدمن فقط)
    path("create/", views.create_booking, name="booking-create"), # POST → إنشاء حجز
    path("<int:pk>/", views.retrieve_booking, name="booking-detail"), # GET → استرجاع حجز محدد
    path("<int:pk>/update/", views.update_booking, name="update_booking"),
    path("<int:pk>/delete/", views.delete_booking, name="booking-delete"), # DELETE → إلغاء الحجز
    path("<int:group_id>/join/", views.join_group, name="join_group"),
    path("<int:group_id>/leave/", views.leave_group, name="leave_group")
]
