from rest_framework import serializers
from .models import Booking
from students.models import Student
from groups.models import Group

class StudentDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "full_name", "email", "phone", "stage"]

class GroupDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name", "stage", "schedule", "days"]

class BookingDetailSerializer(serializers.ModelSerializer):
    student_details = StudentDetailsSerializer(source='student', read_only=True)
    group_details = GroupDetailsSerializer(source='group', read_only=True)
    
    class Meta:
        model = Booking
        fields = ["id", "student", "group", "student_details", "group_details", "created_at"]
        read_only_fields = ["id", "created_at"]

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["id", "student", "group", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        
        try:
            student = request.user.student
        except Student.DoesNotExist:
            raise serializers.ValidationError("لا يوجد طالب مرتبط بهذا المستخدم")
        
        validated_data["student"] = student
        
        if Booking.objects.filter(student=student, group=validated_data["group"]).exists():
            raise serializers.ValidationError("لديك حجز مسبق في هذه المجموعة")
        
        group = validated_data["group"]
        if group.is_full:
            raise serializers.ValidationError("المجموعة ممتلئة")
        
        return super().create(validated_data)