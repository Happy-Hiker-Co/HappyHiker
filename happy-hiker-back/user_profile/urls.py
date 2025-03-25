from django.urls import path
# from .views import auth0_register
from .views import protected_view


urlpatterns = [
    # path('auth0-register/', auth0_register, name='auth0-register'),
    path("protected/", protected_view, name="protected"),
]
