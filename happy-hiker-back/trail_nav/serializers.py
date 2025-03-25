from rest_framework import serializers
from .models import Trail, TrailImage, NavigationSession, GPSLog


class TrailImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrailImage
        fields = ["id", "image", "caption"]


class TrailSerializer(serializers.ModelSerializer):
    images = TrailImageSerializer(many=True, read_only=True)

    class Meta:
        model = Trail
        fields = [
            "id",
            "name",
            "lat",
            "long",
            "distance",
            "elevation",
            "difficulty",
            "is_dog_friendly",
            "images",
        ]


class GPSLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = GPSLog
        fields = ["id", "latitude", "longitude", "timestamp"]


class NavigationSessionSerializer(serializers.ModelSerializer):
    gps_logs = GPSLogSerializer(many=True, read_only=True)

    class Meta:
        model = NavigationSession
        fields = [
            "id",
            "trail",
            "user",
            "started_at",
            "ended_at",
            "is_active",
            "status",
            "gps_logs",
        ]
        read_only_fields = ["started_at", "ended_at", "gps_logs"]
