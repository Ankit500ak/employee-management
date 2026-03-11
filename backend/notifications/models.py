from django.db import models


class EmailLog(models.Model):
    recipient_email = models.EmailField(db_index=True)
    subject = models.CharField(max_length=255)
    status = models.CharField(max_length=32)
    sent_at = models.DateTimeField(auto_now_add=True)
    error_message = models.TextField(blank=True)

    def __str__(self):
        return f'{self.recipient_email} - {self.status}'
