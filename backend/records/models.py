from django.conf import settings
from django.db import models


class UserRecord(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='record')
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    dob = models.DateField(null=True, blank=True)
    source = models.CharField(max_length=32, default='imported')
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.email} - {self.full_name}'
