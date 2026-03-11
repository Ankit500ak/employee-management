from django.contrib import admin

from imports.models import ImportJob, ImportRowLog

admin.site.register(ImportJob)
admin.site.register(ImportRowLog)
