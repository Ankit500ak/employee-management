from rest_framework import generics, permissions

from accounts.permissions import MustChangePasswordClear
from notifications.models import EmailLog
from notifications.serializers import EmailLogSerializer


class EmailLogListView(generics.ListAPIView):
    queryset = EmailLog.objects.all().order_by('-sent_at')
    serializer_class = EmailLogSerializer
    permission_classes = [permissions.IsAdminUser, MustChangePasswordClear]
