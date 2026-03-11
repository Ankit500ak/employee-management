import hashlib
import secrets
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)
    must_change_password = models.BooleanField(default=True)
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']


class AccessRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('DENIED', 'Denied'),
    ]
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='access_requests')
    approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests_to_approve')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']


class OTP(models.Model):
    email = models.EmailField(db_index=True)
    otp_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def generate_code(length=6):
        return ''.join(str(secrets.randbelow(10)) for _ in range(length))

    @classmethod
    def create_otp(cls, email, ttl_minutes=10):
        code = cls.generate_code()
        hashed = hashlib.sha256(code.encode('utf-8')).hexdigest()
        otp = cls.objects.create(
            email=email,
            otp_hash=hashed,
            expires_at=timezone.now() + timedelta(minutes=ttl_minutes),
        )
        return otp, code

    def verify(self, code):
        if self.is_used or self.expires_at < timezone.now():
            return False
        hashed = hashlib.sha256(code.encode('utf-8')).hexdigest()
        if hashed != self.otp_hash:
            return False
        self.is_used = True
        self.save(update_fields=['is_used'])
        return True
