from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.core.validators import RegexValidator

class User(AbstractUser):
    phone_regex = RegexValidator(
        regex=r'^01[0-2,5][0-9]{8}$',
        message="رقم الهاتف المصري غير صالح. مثال: 01012345678"
    )
    phone = models.CharField(max_length=11, validators=[phone_regex], blank=True, null=True, unique=True)

    # منع clashes مع auth.User
    groups = models.ManyToManyField(
        Group,
        related_name="custom_user_groups",
        blank=True,
        help_text="المجموعات التي ينتمي لها المستخدم"
    )
    user_permissions = models.ManyToManyField(
        Permission,     
        related_name="custom_user_permissions",
        blank=True,
        help_text="صلاحيات المستخدم الخاصة"
    )

    def __str__(self):
        return self.username
