from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from chat.models import Message
from chat.serializers import MessageSerializer
from django.db.models import Q

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        team_id = self.request.query_params.get('team')
        recipient_id = self.request.query_params.get('recipient')

        queryset = Message.objects.filter(
            Q(sender=user) | 
            Q(recipient=user) | 
            Q(team__members=user) | 
            Q(team__creator=user)
        ).distinct()

        if team_id:
            queryset = queryset.filter(team_id=team_id)
        elif recipient_id:

            queryset = queryset.filter(
                (Q(sender=user) & Q(recipient_id=recipient_id)) |
                (Q(sender_id=recipient_id) & Q(recipient=user))
            )
        else:

            pass

        return queryset.order_by('timestamp')

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        teams_summary = {}
        users_summary = {}


        messages = Message.objects.filter(
            Q(sender=user) | 
            Q(recipient=user) | 
            Q(team__members=user) | 
            Q(team__creator=user)
        ).prefetch_related('read_by').order_by('timestamp')

        for msg in messages:
            read_users = [u.id for u in msg.read_by.all()]
            is_unread = (user.id not in read_users) and (msg.sender_id != user.id)
            ts = msg.timestamp

            if msg.team_id:
                tid = str(msg.team_id)
                if tid not in teams_summary:
                    teams_summary[tid] = {'unread': 0, 'latest': ts}
                teams_summary[tid]['latest'] = ts
                if is_unread:
                    teams_summary[tid]['unread'] += 1
            elif msg.recipient_id or msg.sender_id:
                other_user_id = msg.recipient_id if msg.sender_id == user.id else msg.sender_id
                uid = str(other_user_id)
                if uid not in users_summary:
                    users_summary[uid] = {'unread': 0, 'latest': ts}
                users_summary[uid]['latest'] = ts
                if is_unread:
                    users_summary[uid]['unread'] += 1

        return Response({
            'teams': teams_summary,
            'users': users_summary
        })

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        user = request.user
        team_id = request.data.get('team_id')
        user_id = request.data.get('user_id')

        if team_id:
            messages = Message.objects.filter(team_id=team_id).exclude(sender=user)
        elif user_id:
            messages = Message.objects.filter(sender_id=user_id, recipient=user)
        else:
            return Response({'detail': 'Must provide team_id or user_id'}, status=400)

        for msg in messages:
            msg.read_by.add(user)
            
        return Response({'status': 'ok'})
