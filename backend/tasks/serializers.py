from rest_framework import serializers

from accounts.serializers import UserSerializer
from teams.serializers import TeamSerializer
from tasks.models import Task


class TaskSerializer(serializers.ModelSerializer):
    created_by_user = UserSerializer(source='created_by', read_only=True)
    assigned_to_user = UserSerializer(source='assigned_to', read_only=True)
    team_detail = TeamSerializer(source='team', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'created_by',
            'created_by_user',
            'assigned_to',
            'assigned_to_user',
            'team',
            'team_detail',
            'status',
            'due_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def validate(self, data):
        if not data.get('assigned_to') and not data.get('team'):
            raise serializers.ValidationError("Either assigned_to or team must be provided.")
        return data

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
