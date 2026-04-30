from rest_framework import serializers
from django.contrib.auth import get_user_model
from teams.models import Team
from accounts.serializers import UserSerializer

User = get_user_model()

class TeamSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    members_list = UserSerializer(source='members', many=True, read_only=True)
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'creator', 'members', 'members_list', 'created_at']
        read_only_fields = ['creator', 'created_at']

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        validated_data['creator'] = self.context['request'].user
        team = Team.objects.create(**validated_data)
        team.members.set(members)
        return team
