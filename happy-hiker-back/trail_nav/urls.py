from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StartNavigationView,
    UpdateGPSView,
    PauseNavigationView,
    StopNavigationView,
    NavigationHistoryView,
    TrailViewSet,
)


router = DefaultRouter()
router.register(r"trails", TrailViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("nav/start/", StartNavigationView.as_view()),
    path("nav/update/", UpdateGPSView.as_view()),
    path("nav/pause/", PauseNavigationView.as_view()),
    path("nav/stop/", StopNavigationView.as_view()),
    path("nav/history/", NavigationHistoryView.as_view()),
]
