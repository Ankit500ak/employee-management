from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import MustChangePasswordClear
from imports.models import ImportJob
from imports.serializers import ImportJobSerializer, ImportUploadSerializer
from imports.services import process_import_file


class ImportUploadView(APIView):
    permission_classes = [permissions.IsAdminUser, MustChangePasswordClear]

    def post(self, request):
        serializer = ImportUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        upload = serializer.validated_data['file']

        if not upload.name.endswith('.xlsx'):
            return Response({'detail': 'Only .xlsx files are supported.'}, status=status.HTTP_400_BAD_REQUEST)

        job = process_import_file(upload, request.user)
        return Response(ImportJobSerializer(job).data, status=status.HTTP_201_CREATED)


class ImportJobListView(generics.ListAPIView):
    queryset = ImportJob.objects.all().order_by('-created_at')
    serializer_class = ImportJobSerializer
    permission_classes = [permissions.IsAdminUser, MustChangePasswordClear]


class ImportJobDetailView(generics.RetrieveAPIView):
    queryset = ImportJob.objects.all()
    serializer_class = ImportJobSerializer
    permission_classes = [permissions.IsAdminUser, MustChangePasswordClear]
