from rest_framework import serializers
from .models import Booking
from students.models import Student

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