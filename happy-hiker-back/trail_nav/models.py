from django.contrib.gis.db import models


class Trail(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to="trail_images/", null=True, blank=True)
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
