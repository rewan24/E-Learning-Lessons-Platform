from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

class CreateBookingSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    group_id = serializers.IntegerField()
