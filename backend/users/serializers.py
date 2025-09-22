from rest_framework import serializers
from django.contrib.auth.hashers import make_password   
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "phone", "password", "is_staff", "is_superuser", "is_active"]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'is_staff': {'read_only': True},
            'is_superuser': {'read_only': True},
            'is_active': {'read_only': True},
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)
    
    
