# user_profile/urls.py

from django.urls import path
from .views import register_or_get_user

urlpatterns = [
    path("register/", register_or_get_user, name="register_user"),
]
