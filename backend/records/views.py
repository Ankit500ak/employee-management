from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import MustChangePasswordClear
from records.models import UserRecord
from records.serializers import UserRecordSerializer


class MyRecordView(APIView):
    permission_classes = [permissions.IsAuthenticated, MustChangePasswordClear]

    def get_object(self, user):
        return UserRecord.objects.filter(user=user, is_deleted=False).first()

    def get(self, request):
        record = self.get_object(request.user)
        if not record:
            return Response({'detail': 'Record not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserRecordSerializer(record).data)

    def put(self, request):
        record = self.get_object(request.user)
        if not record:
            serializer = UserRecordSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=request.user, source='self_registered', is_deleted=False)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        serializer = UserRecordSerializer(record, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request):
        record = self.get_object(request.user)
        if not record:
            return Response({'detail': 'Record not found.'}, status=status.HTTP_404_NOT_FOUND)
        record.is_deleted = True
        record.save(update_fields=['is_deleted'])
        return Response({'detail': 'Record deleted successfully.'})
