import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from notifications.models import EmailLog

logger = logging.getLogger('notifications')


def log_email(recipient_email, subject, status, error_message=''):
    return EmailLog.objects.create(
        recipient_email=recipient_email,
        subject=subject,
        status=status,
        error_message=error_message,
    )


def _build_credentials_html(full_name, login_id, temp_password, login_url):
    """Return a styled HTML email body for new-user credentials."""
    name = full_name or login_id
    return f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#141720;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.4);">

  <!-- Accent bar -->
  <tr><td style="height:4px;background:linear-gradient(90deg,#4f8ef7,#a78bfa,#4f8ef7);"></td></tr>

  <!-- Logo / Brand -->
  <tr><td style="padding:32px 40px 0;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:36px;height:36px;background:rgba(79,142,247,.12);border-radius:8px;text-align:center;vertical-align:middle;">
        <span style="color:#4f8ef7;font-size:18px;font-weight:700;">D</span>
      </td>
      <td style="padding-left:12px;font-size:16px;font-weight:600;color:#e8ecf5;letter-spacing:.03em;">DataVault</td>
    </tr></table>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:28px 40px 0;">
    <h1 style="margin:0;font-size:22px;font-weight:600;color:#e8ecf5;">Welcome, {name}!</h1>
    <p style="margin:8px 0 0;font-size:14px;color:#8b93ad;line-height:1.6;">
      Your account has been created. Use the credentials below to sign in.
    </p>
  </td></tr>

  <!-- Credentials box -->
  <tr><td style="padding:24px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1e2e;border:1px solid #1f2437;border-radius:10px;">
      <tr><td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#4d5570;padding-bottom:6px;">Login&nbsp;ID</td>
          </tr>
          <tr>
            <td style="font-family:'Courier New',monospace;font-size:15px;font-weight:600;color:#e8ecf5;padding-bottom:16px;">{login_id}</td>
          </tr>
          <tr>
            <td style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:#4d5570;padding-bottom:6px;">Temporary&nbsp;Password</td>
          </tr>
          <tr>
            <td style="font-family:'Courier New',monospace;font-size:15px;font-weight:600;color:#f59e0b;background:#20253a;border-radius:6px;padding:8px 12px;display:inline-block;">{temp_password}</td>
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>

  <!-- CTA Button -->
  <tr><td style="padding:0 40px 8px;" align="center">
    <a href="{login_url}" style="display:inline-block;background:#4f8ef7;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 36px;border-radius:8px;box-shadow:0 4px 16px rgba(79,142,247,.3);">
      Sign In Now &rarr;
    </a>
  </td></tr>

  <!-- Security notice -->
  <tr><td style="padding:20px 40px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:8px;">
      <tr><td style="padding:14px 18px;">
        <p style="margin:0;font-size:12px;color:#f87171;line-height:1.5;">
          &#9888;&#65039; <strong>Important:</strong> You will be asked to change your password on first login. Do not share these credentials with anyone.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:28px 40px 32px;">
    <p style="margin:0;font-size:11px;color:#4d5570;line-height:1.5;">
      This is an automated message from <strong style="color:#8b93ad;">DataVault</strong>. If you did not expect this email, please ignore it.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>"""


def send_credentials_email(recipient_email, login_id, temp_password, full_name=''):
    subject = 'Your DataVault Login Credentials'
    login_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173') + '/login'

    plain_body = (
        f'Hi {full_name or login_id},\n\n'
        f'Your account has been created.\n\n'
        f'Login ID: {login_id}\n'
        f'Temporary Password: {temp_password}\n\n'
        f'Sign in at: {login_url}\n'
        f'Please change your password on first login.\n'
    )
    html_body = _build_credentials_html(full_name, login_id, temp_password, login_url)

    try:
        logger.info('[EMAIL] Sending credentials to %s (name=%s) from %s', recipient_email, full_name or '-', settings.DEFAULT_FROM_EMAIL)
        msg = EmailMultiAlternatives(subject, plain_body, settings.DEFAULT_FROM_EMAIL, [recipient_email])
        msg.attach_alternative(html_body, 'text/html')
        msg.send(fail_silently=False)
        log_email(recipient_email, subject, 'SENT')
        logger.info('[EMAIL] ✓ Credentials sent successfully to %s', recipient_email)
        return True
    except Exception as exc:
        log_email(recipient_email, subject, 'FAILED', str(exc))
        logger.error('[EMAIL] ✗ Failed to send credentials to %s: %s', recipient_email, exc)
        return False
