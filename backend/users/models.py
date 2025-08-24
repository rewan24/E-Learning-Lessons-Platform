# from django.db import models

# class User(models.Model):
#     username = models.CharField(max_length=100, unique=True) 
#     email = models.EmailField(unique=True)  
#     phone = models.CharField(max_length=20, blank=True, null=True)  
#     password = models.CharField(max_length=128)  

#     def __str__(self):
#         return self.username
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

class User(AbstractUser):
    phone_regex = RegexValidator(
        regex=r'^01[0-2,5][0-9]{8}$',
        message="رقم الهاتف المصري غير صالح. مثال: 01012345678"
    )
    phone = models.CharField(max_length=11, validators=[phone_regex], blank=True, null=True)
    
    def __str__(self):
        return self.username
