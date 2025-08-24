from django.db import models
from students.models import Student
from groups.models import Group

class Booking(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='bookings')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='bookings')
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'group')
        ordering = ['-booked_at']

    def save(self, *args, **kwargs):
        if self.group.students.count() >= self.group.capacity:
            raise ValueError("المجموعة امتلأت، لا يمكن الحجز")
        super().save(*args, **kwargs)
