from rest_framework import serializers

from records.models import UserRecord


class UserRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRecord
        fields = [
            'id',
            'full_name',
            'phone',
            'address',
            'dob',
            'source',
            'is_deleted',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'source', 'created_at', 'updated_at']
