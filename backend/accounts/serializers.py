from django.contrib.auth import authenticate
from rest_framework import serializers

from accounts.models import OTP, AccessRequest, User


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(username=attrs['email'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('User account is inactive.')
        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=False, default='')
    new_password = serializers.CharField(write_only=True, min_length=8)


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(min_length=6, max_length=6)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    dob = serializers.DateField(required=False)
    otp_code = serializers.CharField(min_length=6, max_length=6)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists.')
        return value


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'is_active', 'is_staff', 'is_verified', 'must_change_password']


class AccessRequestSerializer(serializers.ModelSerializer):
    requester_email = serializers.EmailField(source='requester.email', read_only=True)
    approver_email = serializers.EmailField(source='approver.email', read_only=True)

    class Meta:
        model = AccessRequest
        fields = ['id', 'requester', 'requester_email', 'approver', 'approver_email',
                  'status', 'created_at', 'resolved_at']
        read_only_fields = ['id', 'requester', 'approver', 'status', 'created_at', 'resolved_at']


class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ['id', 'email', 'expires_at', 'is_used', 'created_at']
