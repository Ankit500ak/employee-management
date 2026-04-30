from django.urls import path

from accounts.views import (
    ChangePasswordView,
    LoginView,
    LogoutView,
    MeView,
    MyAccessRequestView,
    MyCreatedUsersView,
    PendingAccessRequestsView,
    RegisterView,
    RequestAccessView,
    RequestOTPView,
    ResolveAccessRequestView,
    VerifyOTPView,
)

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('change-password/', ChangePasswordView.as_view()),
    path('request-otp/', RequestOTPView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('register/', RegisterView.as_view()),
    path('me/', MeView.as_view()),
    path('created-users/', MyCreatedUsersView.as_view()),
    path('access-request/', RequestAccessView.as_view()),
    path('access-request/mine/', MyAccessRequestView.as_view()),
    path('access-requests/pending/', PendingAccessRequestsView.as_view()),
    path('access-requests/<int:pk>/resolve/', ResolveAccessRequestView.as_view()),
]
