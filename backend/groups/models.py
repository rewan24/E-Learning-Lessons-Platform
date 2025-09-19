from django.db import models
from students.models import Student

class Group(models.Model):
    name = models.CharField(max_length=100, unique=True)
    stage = models.CharField(max_length=10, choices=(("GRADE6", "سادس ابتدائي"), ("PREP", "إعدادي")))
    capacity = models.PositiveIntegerField(default=10)
    schedule = models.CharField(max_length=100)
    days = models.CharField(max_length=100, blank=True)
    students = models.ManyToManyField(Student, through='bookings.Booking', related_name="groups", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def seats_left(self):
        return self.capacity - self.bookings.count()

    @property
    def is_full(self):
        return self.bookings.count() >= self.capacity
    
    def can_join(self, student):
        """تحقق إذا كان الطالب يمكنه الانضمام للمجموعة"""
        if self.is_full:
            return False, "المجموعة ممتلئة"
        if self.bookings.filter(student=student).exists():
            return False, "الطالب مسجل بالفعل في هذه المجموعة"
        return True, "يمكن الانضمام"
    
    def __str__(self):
        return f"{self.name} - {self.schedule} - {self.days}"