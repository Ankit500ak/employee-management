from rest_framework.permissions import BasePermission


class MustChangePasswordClear(BasePermission):
    message = 'Password change required before accessing this resource.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return not user.must_change_password
