from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from notifications.services import send_task_assignment_email
from tasks.models import Task
from tasks.serializers import TaskSerializer

User = get_user_model()


class IsTaskCreatorOrAssignee(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.created_by or request.user == obj.assigned_to


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.user
        return Task.objects.filter(
            Q(created_by=user) | 
            Q(assigned_to=user) | 
            Q(assigned_to__parent=user) |
            Q(team__members=user) | 
            Q(team__creator=user)
        ).distinct()

    @property
    def user(self):
        return self.request.user

    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)
        
        assigner_name = f"{self.request.user.first_name} {self.request.user.last_name}".strip() or self.request.user.username
        
        if task.assigned_to and task.assigned_to != self.request.user:
            new_assignee = task.assigned_to
            full_name = f"{new_assignee.first_name} {new_assignee.last_name}".strip()
            
            send_task_assignment_email(
                recipient_email=new_assignee.email,
                full_name=full_name,
                task_title=task.title,
                task_description=task.description,
                assigner_name=assigner_name
            )
        
        if task.team:
            for member in task.team.members.all():
                if member != self.request.user:
                    full_name = f"{member.first_name} {member.last_name}".strip()
                    send_task_assignment_email(
                        recipient_email=member.email,
                        full_name=full_name,
                        task_title=f"{task.title} (Team: {task.team.name})",
                        task_description=task.description,
                        assigner_name=assigner_name
                    )

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=False, methods=['get'])
    def created_by_me(self, request):
        """Get all tasks created by the current user or assigned to their sub-users"""
        tasks = self.get_queryset().filter(
            Q(created_by=request.user) |
            Q(assigned_to__parent=request.user)
        ).distinct()
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def assigned_to_me(self, request):
        """Get all tasks assigned to the current user (individually or via team if not explicitly claimed)"""
        tasks = self.get_queryset().filter(
            Q(assigned_to=request.user) | 
            (Q(team__members=request.user) & Q(assigned_to__isnull=True))
        ).distinct()
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_children_tasks(self, request):
        """Get all tasks assigned to users created by the current user (admin view)"""
        children = request.user.children.all()
        tasks = Task.objects.filter(assigned_to__in=children, created_by=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get task statistics for the dashboard"""
        from django.utils import timezone
        
        tasks = self.get_queryset()
        now = timezone.now()
        
        total = tasks.count()
        pending = tasks.filter(status='PENDING').count()
        in_progress = tasks.filter(status='IN_PROGRESS').count()
        completed = tasks.filter(status='COMPLETED').count()
        

        overdue_tasks = tasks.filter(
            due_date__lt=now
        ).exclude(
            status__in=['COMPLETED', 'CANCELLED']
        ).order_by('due_date')
        
        serializer = self.get_serializer(overdue_tasks, many=True)
        
        return Response({
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'completed': completed,
            'overdue_tasks': serializer.data
        })

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update task status"""
        task = self.get_object()
        if 'status' not in request.data:
            return Response({'detail': 'Status is required.'}, status=status.HTTP_400_BAD_REQUEST)

        status_value = request.data['status']
        valid_statuses = [choice[0] for choice in Task.STATUS_CHOICES]
        if status_value not in valid_statuses:
            return Response({'detail': f'Invalid status. Choose from {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)

        task.status = status_value
        task.save(update_fields=['status'])
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['post'])
    def reassign(self, request, pk=None):
        """Reassign task to a sub-user"""
        if not request.user.is_verified:
            return Response({'detail': 'You must be a verified user to reassign tasks.'}, status=status.HTTP_403_FORBIDDEN)

        task = self.get_object()
        

        can_reassign = (
            request.user == task.assigned_to or 
            request.user == task.created_by or 
            (task.team and task.team.members.filter(id=request.user.id).exists())
        )
        if not can_reassign:
            return Response({'detail': 'You do not have permission to reassign this task.'}, status=status.HTTP_403_FORBIDDEN)

        if 'assigned_to' not in request.data:
            return Response({'detail': 'assigned_to is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_assignee_id = request.data['assigned_to']
            new_assignee = User.objects.get(pk=new_assignee_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


        if new_assignee.parent != request.user:
            return Response({'detail': 'You can only assign tasks to your sub-users.'}, status=status.HTTP_400_BAD_REQUEST)

        task.assigned_to = new_assignee
        task.save(update_fields=['assigned_to'])
        

        full_name = f"{new_assignee.first_name} {new_assignee.last_name}".strip()
        assigner_name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
        
        send_task_assignment_email(
            recipient_email=new_assignee.email,
            full_name=full_name,
            task_title=task.title,
            task_description=task.description,
            assigner_name=assigner_name
        )

        return Response(TaskSerializer(task).data)
