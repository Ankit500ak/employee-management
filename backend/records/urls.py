from django.urls import path

from records.views import MyRecordView

urlpatterns = [
    path('me/', MyRecordView.as_view()),
]
