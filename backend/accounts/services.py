import logging
import secrets
import string

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.db import transaction

from accounts.models import OTP
from notifications.services import log_email, send_credentials_email
from records.models import UserRecord

logger = logging.getLogger('accounts')

User = get_user_model()


def generate_temp_password(length=12):
    alphabet = string.ascii_letters + string.digits + '!@#$%'
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def _build_otp_html(code):
    """Return a styled HTML email for OTP verification."""
    return f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#141720;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.4);">

  <!-- Accent bar -->
  <tr><td style="height:4px;background:linear-gradient(90deg,#4f8ef7,#a78bfa,#4f8ef7);"></td></tr>

  <!-- Brand -->
  <tr><td style="padding:32px 40px 0;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:36px;height:36px;background:rgba(79,142,247,.12);border-radius:8px;text-align:center;vertical-align:middle;">
        <span style="color:#4f8ef7;font-size:18px;font-weight:700;">D</span>
      </td>
      <td style="padding-left:12px;font-size:16px;font-weight:600;color:#e8ecf5;letter-spacing:.03em;">DataVault</td>
    </tr></table>
  </td></tr>

  <!-- Heading -->
  <tr><td style="padding:28px 40px 0;">
    <h1 style="margin:0;font-size:22px;font-weight:600;color:#e8ecf5;">Verification Code</h1>
    <p style="margin:8px 0 0;font-size:14px;color:#8b93ad;line-height:1.6;">
      Use the code below to verify your email address. It expires in <strong style="color:#e8ecf5;">10 minutes</strong>.
    </p>
  </td></tr>

  <!-- OTP Code -->
  <tr><td style="padding:24px 40px;" align="center">
    <table cellpadding="0" cellspacing="0" style="background:#1a1e2e;border:1px solid #1f2437;border-radius:10px;">
      <tr><td style="padding:20px 48px;" align="center">
        <span style="font-family:'Courier New',monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:#4f8ef7;">{code}</span>
      </td></tr>
    </table>
  </td></tr>

  <!-- Warning -->
  <tr><td style="padding:0 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.15);border-radius:8px;">
      <tr><td style="padding:12px 18px;">
        <p style="margin:0;font-size:12px;color:#f59e0b;line-height:1.5;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 40px 32px;">
    <p style="margin:0;font-size:11px;color:#4d5570;line-height:1.5;">
      This is an automated message from <strong style="color:#8b93ad;">DataVault</strong>.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>"""


def request_otp(email):
    otp, plain_code = OTP.create_otp(email=email)
    subject = 'Your DataVault Verification Code'
    plain_body = f'Your OTP is {plain_code}. It expires in 10 minutes.'
    html_body = _build_otp_html(plain_code)
    try:
        logger.info('[OTP] Sending OTP to %s from %s', email, settings.DEFAULT_FROM_EMAIL)
        msg = EmailMultiAlternatives(subject, plain_body, settings.DEFAULT_FROM_EMAIL, [email])
        msg.attach_alternative(html_body, 'text/html')
        msg.send(fail_silently=False)
        log_email(email, subject, 'SENT')
        logger.info('[OTP] ✓ OTP sent successfully to %s', email)
    except Exception as exc:
        log_email(email, subject, 'FAILED', str(exc))
        logger.error('[OTP] ✗ Failed to send OTP to %s: %s', email, exc)
        raise
    return otp


def verify_latest_otp(email, code):
    otp = OTP.objects.filter(email=email).order_by('-created_at').first()
    if not otp:
        logger.warning('[OTP] ✗ No OTP found for %s', email)
        return False
    result = otp.verify(code)
    if result:
        logger.info('[OTP] ✓ OTP verified for %s', email)
    else:
        logger.warning('[OTP] ✗ OTP verification failed for %s (used=%s, expired=%s)', email, otp.is_used, otp.expires_at)
    return result


@transaction.atomic
def register_user_with_record(validated_data):
    from records.services import create_or_update_record

    password = generate_temp_password()
    full_name = validated_data['full_name']
    email = validated_data['email']
    username = email.split('@')[0]

    has_admin = User.objects.filter(is_staff=True).exists()

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_verified=True,
        must_change_password=True,
        is_staff=not has_admin,
        is_superuser=not has_admin,
    )

    create_or_update_record(
        user=user,
        full_name=full_name,
        phone=validated_data.get('phone', ''),
        address=validated_data.get('address', ''),
        dob=validated_data.get('dob'),
        source='self_registered',
    )

    logger.info('[REGISTER] User created: %s (%s), sending credentials...', email, full_name)
    send_credentials_email(email, email, password, full_name=full_name)

    return user


def send_access_request_email(access_request):
    """Email the parent admin that a child has requested admin access."""
    parent = access_request.approver
    child = access_request.requester
    child_name = ''
    try:
        child_name = child.record.full_name
    except Exception:
        pass
    child_label = child_name or child.email

    subject = f'Admin Access Request from {child_label}'
    review_url = f'{settings.FRONTEND_URL}/dashboard'
    plain_body = (
        f'{child_label} ({child.email}) has requested admin access.\n'
        f'Review the request in your dashboard: {review_url}'
    )
    html_body = f"""\
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#141720;border-radius:12px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#6366f1,#818cf8);padding:28px 32px;">
  <h1 style="margin:0;color:#fff;font-size:20px;">&#128274; Admin Access Request</h1>
</td></tr>
<tr><td style="padding:32px;">
  <p style="color:#c9d1d9;font-size:15px;line-height:1.6;margin:0 0 20px;">
    <strong style="color:#e6edf3;">{child_label}</strong> ({child.email}) has requested admin access to DataVault.
  </p>
  <p style="color:#8b949e;font-size:14px;margin:0 0 28px;">
    Log in to your dashboard to approve or deny this request.
  </p>
  <table cellpadding="0" cellspacing="0"><tr><td style="background:#6366f1;border-radius:8px;">
    <a href="{review_url}" style="display:inline-block;padding:12px 28px;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">
      Review Request
    </a>
  </td></tr></table>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #21262d;">
  <p style="color:#484f58;font-size:12px;margin:0;">DataVault &mdash; Secure Record Management</p>
</td></tr>
</table>
</td></tr></table>
</body></html>"""
    try:
        logger.info('[ACCESS] Sending access-request email to parent %s (child=%s)', parent.email, child.email)
        msg = EmailMultiAlternatives(subject, plain_body, settings.DEFAULT_FROM_EMAIL, [parent.email])
        msg.attach_alternative(html_body, 'text/html')
        msg.send(fail_silently=False)
        log_email(parent.email, subject, 'SENT')
        logger.info('[ACCESS] ✓ Access-request email sent to %s', parent.email)
    except Exception as exc:
        log_email(parent.email, subject, 'FAILED', str(exc))
        logger.error('[ACCESS] ✗ Failed to send access-request email to %s: %s', parent.email, exc)
