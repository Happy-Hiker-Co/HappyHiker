from rest_framework import serializers
from .models import Trail, TrailImage


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
