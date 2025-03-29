from django.contrib import admin
from .models import User, Profile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("auth0_id", "name", "email")

admin.site.register(Profile)
