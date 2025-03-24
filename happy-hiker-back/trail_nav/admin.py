from django.contrib import admin
from .models import Trail, TrailImage, NavigationSession, GPSLog

admin.site.register(Trail)
admin.site.register(TrailImage)
admin.site.register(NavigationSession)
admin.site.register(GPSLog)
