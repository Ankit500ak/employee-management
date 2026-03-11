from rest_framework import serializers

from imports.models import ImportJob, ImportRowLog


class ImportUploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class ImportRowLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportRowLog
        fields = ['id', 'row_number', 'email', 'status', 'error_message']


class ImportJobSerializer(serializers.ModelSerializer):
    rows = ImportRowLogSerializer(many=True, read_only=True)

    class Meta:
        model = ImportJob
        fields = [
            'id',
            'file_name',
            'uploaded_by',
            'status',
            'total_rows',
            'success_count',
            'failed_count',
            'created_at',
            'rows',
        ]
