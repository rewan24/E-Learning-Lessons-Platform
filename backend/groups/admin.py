from django.contrib import admin
from .models import Group

# Register your models here.
@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'stage', 'capacity', 'seats_left' ,'schedule', 'days', 'created_at', 'updated_at')
    list_filter = ('stage', 'created_at', 'updated_at')
    search_fields = ('name', 'stage', 'schedule', 'days')