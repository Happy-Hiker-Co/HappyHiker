import json
import requests
from jose import jwt
from django.conf import settings
from django.http import JsonResponse

AUTH0_DOMAIN = settings.AUTH0_DOMAIN
API_IDENTIFIER = settings.AUTH0_AUDIENCE
ALGORITHMS = ["RS256"]

def requires_auth(view_func):
    def wrapper(request, *args, **kwargs):
        auth = request.META.get("HTTP_AUTHORIZATION", None)
        if not auth:
            return JsonResponse({"message": "Authorization header missing"}, status=401)

        parts = auth.split()
        if parts[0].lower() != "bearer" or len(parts) != 2:
            return JsonResponse({"message": "Invalid authorization header"}, status=401)

        token = parts[1]

        jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
        jwks = requests.get(jwks_url).json()

        unverified_header = jwt.get_unverified_header(token)

        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }

        if rsa_key:
            try:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=ALGORITHMS,
                    audience=API_IDENTIFIER,
                    issuer=f"https://{AUTH0_DOMAIN}/"
                )
                request.user_payload = payload
            except jwt.ExpiredSignatureError:
                return JsonResponse({"message": "Token expired"}, status=401)
            except jwt.JWTClaimsError:
                return JsonResponse({"message": "Incorrect claims"}, status=401)
            except Exception as e:
                return JsonResponse({"message": f"Token error: {str(e)}"}, status=401)
        else:
            return JsonResponse({"message": "Unable to find RSA key"}, status=401)

        return view_func(request, *args, **kwargs)

    return wrapper
