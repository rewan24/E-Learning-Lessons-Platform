from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'stage', 'email', 'phone')
    list_filter = ('stage',)
    search_fields = ('full_name', 'email', 'phone')
