from rest_framework import serializers

from notifications.models import EmailLog


class EmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = ['id', 'recipient_email', 'subject', 'status', 'sent_at', 'error_message']
