from django.urls import path

from imports.views import ImportJobDetailView, ImportJobListView, ImportUploadView

urlpatterns = [
    path('upload/', ImportUploadView.as_view()),
    path('', ImportJobListView.as_view()),
    path('<int:pk>/', ImportJobDetailView.as_view()),
]
