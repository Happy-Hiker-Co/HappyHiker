from django.db import models

class User(models.Model):
    # auth0_id might be used to track info about users
    auth0_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255, null=True)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.name} {self.email}"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # We may want to use a class for Favorite. See below 
    # favorites = models.CharField(max_length=255, null=True, blank=True)
    points = models.IntegerField(default=0)
    # history = models.TextField(null=True, blank=True)  # add later?
    level = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"profile for {self.user.name}"
    

class Favorite(models.Model):
    user_profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    trail_id = models.IntegerField()  # or a ForeignKey to a Trail model
    added_on = models.DateTimeField(auto_now_add=True)

