from rest_framework import serializers
from chat.models import Message
from accounts.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class MessageSerializer(serializers.ModelSerializer):
    sender_detail = UserSerializer(source='sender', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_detail', 'content', 'timestamp', 'team', 'recipient']
        read_only_fields = ['sender', 'timestamp']

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)
