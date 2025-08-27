from django.db import models
from students.models import Student

class Group(models.Model):
    name = models.CharField(max_length=100, unique=True)
    stage = models.CharField(max_length=10, choices=(("GRADE6", "سادس ابتدائي"), ("PREP", "إعدادي")))
    capacity = models.PositiveIntegerField(default=10)
    schedule = models.CharField(max_length=100)
    days = models.CharField(max_length=100, blank=True)
    students = models.ManyToManyField(Student, related_name="groups", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def seats_left(self):
        return self.capacity - self.students.count()

    @property
    def is_full(self):
        return self.students.count() >= self.capacity
    
    def __str__(self):
        return f"{self.name} - {self.schedule} - {self.days}"