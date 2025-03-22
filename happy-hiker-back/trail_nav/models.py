from django.db import models


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
