from django.db import models
from django.conf import settings
from django.utils import timezone


class Trail(models.Model):
    name = models.CharField(max_length=255)
    lat = models.FloatField()
    long = models.FloatField()
    distance = models.FloatField(help_text="Trail distance in miles")
    elevation = models.FloatField(help_text="Elevation gain in feet")
    difficulty = models.CharField(
        max_length=50,
        choices=[("Easy", "Easy"), ("Moderate", "Moderate"), ("Hard", "Hard")],
    )
    is_dog_friendly = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class TrailImage(models.Model):
    trail = models.ForeignKey(Trail, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="trail_images/")
    caption = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.trail.name} image"


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
