from django.db import models

class User(models.Model):
    name = models.CharField(max_length=255, null=True)
    email = models.EmailField()

    def __str__(self):
        return f"{self.name} {self.email}"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    favorites = models.CharField(max_length=255, null=True, blank=True)
    points = models.IntegerField(default=0)
    # history = models.TextField(null=True, blank=True)  # add later?
    level = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"profile for {self.user.name}"
