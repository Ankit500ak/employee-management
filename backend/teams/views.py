from rest_framework import viewsets, permissions
from teams.models import Team
from teams.serializers import TeamSerializer
from django.db.models import Q

class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Team.objects.filter(Q(creator=user) | Q(members=user)).distinct()
