from django.db import models
from django.conf import settings
from django.utils import timezone


class Trail(models.Model):
    name = models.CharField(max_length=255)
    lat = models.FloatField()
    long = models.FloatField()
    distance = models.FloatField(default=0)  # in miles
    elevation = models.IntegerField(default=0)  # in feet
    difficulty = models.CharField(max_length=50, default="Moderate")
    is_dog_friendly = models.BooleanField(default=False)
    is_hiking_trail = models.BooleanField(
        default=False
    )  # ✅ used to filter trails for frontend

    def __str__(self):
        return self.name


class TrailImage(models.Model):
    trail = models.ForeignKey(Trail, related_name="images", on_delete=models.CASCADE)
    image = models.URLField()
    caption = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Image for {self.trail.name}"


class NavigationSession(models.Model):
    trail = models.ForeignKey(Trail, on_delete=models.CASCADE, related_name="sessions")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="navigation_sessions",
    )
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    status = models.CharField(
        max_length=20,
        choices=[("started", "Started"), ("paused", "Paused"), ("stopped", "Stopped")],
        default="started",
    )

    def __str__(self):
        return f"{self.user.username} on {self.trail.name} ({self.status})"


class GPSLog(models.Model):
    session = models.ForeignKey(
        NavigationSession, on_delete=models.CASCADE, related_name="gps_logs"
    )
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.session.user.username} at {self.latitude}, {self.longitude} on {self.timestamp}"
