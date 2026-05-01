import json
import logging
import requests
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings

logger = logging.getLogger('accounts')

class HttpEmailBackend(BaseEmailBackend):
    """
    A custom email backend that sends email by posting to a Google Apps Script Web App API.
    This bypasses Railway's blocked SMTP ports.
    """
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_url = getattr(settings, 'HTTP_EMAIL_API_URL', None)

    def send_messages(self, email_messages):
        if not email_messages:
            return 0
            
        if not self.api_url:
            if not self.fail_silently:
                raise ValueError("HTTP_EMAIL_API_URL is not configured in settings/env.")
            return 0

        sent_count = 0
        for message in email_messages:
            try:
                payload = {
                    "to": ", ".join(message.to),
                    "subject": message.subject,
                    "body": message.body,
                }
                
                # Check for HTML alternative
                if hasattr(message, 'alternatives') and message.alternatives:
                    for content, mimetype in message.alternatives:
                        if mimetype == 'text/html':
                            payload['htmlBody'] = content
                            break

                response = requests.post(self.api_url, json=payload, timeout=10)
                response.raise_for_status()
                
                result = response.json()
                if result.get('status') == 'success':
                    sent_count += 1
                else:
                    logger.error(f"[HttpEmailBackend] Error from API: {result.get('message')}")
                    if not self.fail_silently:
                        raise Exception(f"Email API Error: {result.get('message')}")

            except Exception as e:
                logger.error(f"[HttpEmailBackend] Failed to send email to {message.to}: {str(e)}")
                if not self.fail_silently:
                    raise

        return sent_count
