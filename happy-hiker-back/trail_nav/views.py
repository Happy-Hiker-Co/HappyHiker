from django.shortcuts import render

from rest_framework import viewsets
from .models import Trail
from .serializers import TrailSerializer


class TrailViewSet(viewsets.ModelViewSet):
    queryset = Trail.objects.all()
    serializer_class = TrailSerializer
