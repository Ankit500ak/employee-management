from django.urls import path

from notifications.views import EmailLogListView

urlpatterns = [
    path('email-logs/', EmailLogListView.as_view()),
]
