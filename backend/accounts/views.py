from django.contrib.auth import get_user_model, login as auth_login, logout as auth_logout
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import AccessRequest
from accounts.serializers import (
    AccessRequestSerializer,
    ChangePasswordSerializer,
    LoginSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    RegisterSerializer,
    UserSerializer,
)
from accounts.services import register_user_with_record, request_otp, verify_latest_otp

User = get_user_model()


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        auth_login(request, user)
        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,
                'must_change_password': user.must_change_password,
            }
        )


class LogoutView(APIView):
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        auth_logout(request)
        return Response({'detail': 'Logged out successfully.'})


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if user.must_change_password:
            # First-time login: user already proved identity by logging in
            pass
        else:
            old_password = serializer.validated_data.get('old_password', '')
            if not old_password:
                return Response({'detail': 'Current password is required.'}, status=status.HTTP_400_BAD_REQUEST)
            if not user.check_password(old_password):
                return Response({'detail': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.must_change_password = False
        user.save(update_fields=['password', 'must_change_password'])
        return Response({'detail': 'Password changed successfully.'})


class RequestOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request_otp(serializer.validated_data['email'])
        return Response({'detail': 'OTP sent successfully.'})


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        is_valid = verify_latest_otp(
            serializer.validated_data['email'], serializer.validated_data['otp_code']
        )
        if not is_valid:
            return Response({'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'detail': 'OTP verified.'})


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        verified = verify_latest_otp(
            serializer.validated_data['email'], serializer.validated_data['otp_code']
        )
        if not verified:
            return Response({'detail': 'OTP verification failed.'}, status=status.HTTP_400_BAD_REQUEST)
        user = register_user_with_record(serializer.validated_data)
        return Response({'detail': 'User registered successfully. Check your email for login credentials.'}, status=201)


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ── Access Request views ──────────────────────────────────────────

class RequestAccessView(APIView):
    """Child user requests admin access from their parent."""

    def post(self, request):
        user = request.user
        if user.is_staff:
            return Response({'detail': 'You already have admin access.'}, status=status.HTTP_400_BAD_REQUEST)
        approver = user.parent
        if not approver:
            # Fallback: assign the first admin user as the approver
            approver = User.objects.filter(is_staff=True).order_by('id').first()
        if not approver:
            return Response({'detail': 'No admin found to handle your request.'}, status=status.HTTP_400_BAD_REQUEST)
        # Persist the parent so future requests go to the same admin
        if not user.parent:
            user.parent = approver
            user.save(update_fields=['parent'])
        existing = AccessRequest.objects.filter(requester=user, status='PENDING').first()
        if existing:
            return Response({'detail': 'You already have a pending request.'}, status=status.HTTP_400_BAD_REQUEST)
        ar = AccessRequest.objects.create(requester=user, approver=approver)
        # Send email to the parent
        from accounts.services import send_access_request_email
        send_access_request_email(ar)
        return Response(AccessRequestSerializer(ar).data, status=status.HTTP_201_CREATED)


class MyAccessRequestView(APIView):
    """Child sees the status of their latest access request."""

    def get(self, request):
        ar = AccessRequest.objects.filter(requester=request.user).first()
        if not ar:
            return Response({'status': None})
        return Response(AccessRequestSerializer(ar).data)


class PendingAccessRequestsView(APIView):
    """Any admin sees all pending requests."""

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        qs = AccessRequest.objects.filter(status='PENDING').order_by('-created_at')
        return Response(AccessRequestSerializer(qs, many=True).data)


class ResolveAccessRequestView(APIView):
    """Admin approves or denies a request."""

    def post(self, request, pk):
        if not request.user.is_staff:
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            ar = AccessRequest.objects.get(pk=pk, status='PENDING')
        except AccessRequest.DoesNotExist:
            return Response({'detail': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)
        action = request.data.get('action')  # 'approve' or 'deny'
        if action == 'approve':
            ar.status = 'APPROVED'
            ar.resolved_at = timezone.now()
            ar.save(update_fields=['status', 'resolved_at'])
            child = ar.requester
            child.is_staff = True
            child.save(update_fields=['is_staff'])
            return Response({'detail': f'Admin access granted to {child.email}.'})
        elif action == 'deny':
            ar.status = 'DENIED'
            ar.resolved_at = timezone.now()
            ar.save(update_fields=['status', 'resolved_at'])
            return Response({'detail': f'Request from {ar.requester.email} denied.'})
        return Response({'detail': 'Invalid action. Use "approve" or "deny".'}, status=status.HTTP_400_BAD_REQUEST)
