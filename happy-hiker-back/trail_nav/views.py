from django.shortcuts import render
from rest_framework import viewsets
from .models import Trail
from .serializers import TrailSerializer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response


from .models import Trail, NavigationSession, GPSLog
from .serializers import NavigationSessionSerializer, GPSLogSerializer


class TrailViewSet(viewsets.ModelViewSet):
    queryset = Trail.objects.all()
    serializer_class = TrailSerializer


class StartNavigationView(APIView):

    def post(self, request):
        trail_id = request.data.get("trail")
        if not trail_id:
            return Response({"error": "Trail ID is required"}, status=400)

        try:
            trail = Trail.objects.get(id=trail_id)
        except Trail.DoesNotExist:
            return Response({"error": "Trail not found"}, status=404)

        # End any active sessions first
        NavigationSession.objects.filter(user=request.user, is_active=True).update(
            is_active=False, status="stopped"
        )

        session = NavigationSession.objects.create(
            trail=trail, user=request.user, status="started", is_active=True
        )
        return Response(NavigationSessionSerializer(session).data, status=201)


class UpdateGPSView(APIView):

    def post(self, request):
        latitude = request.data.get("latitude")
        longitude = request.data.get("longitude")

        try:
            session = NavigationSession.objects.get(user=request.user, is_active=True)
        except NavigationSession.DoesNotExist:
            return Response({"error": "No active navigation session"}, status=400)

        gps_log = GPSLog.objects.create(
            session=session, latitude=latitude, longitude=longitude
        )
        return Response(GPSLogSerializer(gps_log).data, status=201)


class PauseNavigationView(APIView):

    def post(self, request):
        try:
            session = NavigationSession.objects.get(user=request.user, is_active=True)
        except NavigationSession.DoesNotExist:
            return Response({"error": "No active session"}, status=400)

        session.status = "paused"
        session.save()
        return Response(NavigationSessionSerializer(session).data)


class StopNavigationView(APIView):

    def post(self, request):
        try:
            session = NavigationSession.objects.get(user=request.user, is_active=True)
        except NavigationSession.DoesNotExist:
            return Response({"error": "No active session"}, status=400)

        session.status = "stopped"
        session.is_active = False
        session.ended_at = timezone.now()
        session.save()
        return Response(NavigationSessionSerializer(session).data)


class NavigationHistoryView(APIView):

    def get(self, request):
        sessions = NavigationSession.objects.filter(user=request.user).order_by(
            "-started_at"
        )
        return Response(NavigationSessionSerializer(sessions, many=True).data)
