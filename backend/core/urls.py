from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/record/', include('records.urls')),
    path('api/imports/', include('imports.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/teams/', include('teams.urls')),
    path('api/chat/', include('chat.urls')),
]
