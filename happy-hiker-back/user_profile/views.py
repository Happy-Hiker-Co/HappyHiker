from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import User
import json

@csrf_exempt
def register_or_get_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            auth0_id = data.get("auth0_id")
            name = data.get("name") 
            email = data.get("email") 

            if not auth0_id:
                return JsonResponse({"error": "auth0_id is required"}, status=400)

            user, created = User.objects.get_or_create(auth0_id=auth0_id)

            if created or not user.name or not user.email:
                if name:
                    user.name = name
                if email:
                    user.email = email
                user.save()

            return JsonResponse({
                "message": "User retrieved or created successfully",
                "auth0_id": user.auth0_id,
                "name": user.name,
                "email": user.email,
                "created": created
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only POST allowed"}, status=405)


    return JsonResponse({"error": "Only POST allowed"}, status=405)
