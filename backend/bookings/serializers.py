from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "id",
            "student",
            "group",
            "created_at",
        ]
        read_only_fields = ["id", "student", "created_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["student"] = request.user.student  
        return super().create(validated_data)