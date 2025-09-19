from rest_framework import serializers
from .models import Group
from students.models import Student


class StudentMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "full_name", "phone"]  # هتظهر ID واسم الطالب ورقم الموبايل

class GroupSerializer(serializers.ModelSerializer):
    seats_left = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    students = StudentMiniSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = [
            "id", "name", "stage", "capacity", "schedule", "days",
            "students", "seats_left", "is_full", "created_at", "updated_at"
        ]
        read_only_fields = ["seats_left", "is_full", "created_at", "updated_at"]

    def get_seats_left(self, obj):
        return obj.seats_left  

    def get_is_full(self, obj):
        return obj.is_full  
