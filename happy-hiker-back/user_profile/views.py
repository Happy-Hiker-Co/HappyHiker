# user_profile/views.py

from django.http import JsonResponse
from .auth0 import requires_auth

@requires_auth
def protected_view(request):
    user_info = request.user_payload
    return JsonResponse({"message": "Access granted", "user": user_info})





# from django.http import JsonResponse
# from .utils.auth import validate_auth0_token
# from rest_framework.decorators import api_view
# import json
# import jwt
# import os

# import jwt
# import requests

# def get_public_key(auth0_domain):
#     # Fetch the JWKS (JSON Web Key Set) from Auth0
#     jwks_url = f"https://{auth0_domain}/.well-known/jwks.json"
#     jwks = requests.get(jwks_url).json()

#     # Extract the first public key (assuming one key for simplicity)
#     public_key = jwt.algorithms.RSAAlgorithm.from_jwk(jwks['keys'][0])
#     return public_key

# def verify_token(token):
#     try:
#         # Replace "your-auth0-domain" with your actual Auth0 domain
#         auth0_domain = "dev-schhypz7stw633yu.us.auth0.com"
#         public_key = get_public_key(auth0_domain)

#         # Decode the token using the public key
#         decoded_token = jwt.decode(
#             token,
#             key=public_key,
#             algorithms=["RS256"],  # RS256 for Auth0 tokens
#             audience="http://happyhiker/api"  # API identifier set in Auth0
#         )
#         return decoded_token
#     except jwt.ExpiredSignatureError:
#         return {"error": "Token has expired"}
#     except jwt.InvalidAudienceError:
#         return {"error": "Invalid audience"}
#     except jwt.DecodeError:
#         return {"error": "Token decode failed"}
#     except Exception as e:
#         return {"error": f"An unexpected error occurred: {str(e)}"}

# # Example usage
# token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkdERXNhd2x3ZXRuZTZuOGZ0eFNNbSJ9.eyJpc3MiOiJodHRwczovL2Rldi1zY2hoeXB6N3N0dzYzM3l1LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJrRG5IekdXVnI0UXF4QU9GVGZRYUhDUDRkcmdCaG8yd0BjbGllbnRzIiwiYXVkIjoiaHR0cDovL2hhcHB5aGlrZXIvYXBpIiwiaWF0IjoxNzQyODU1MjUxLCJleHAiOjE3NDI5NDE2NTEsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyIsImF6cCI6ImtEbkh6R1dWcjRRcXhBT0ZUZlFhSENQNGRyZ0JobzJ3In0.JuC2Fm_mtZsB5g_BZaEHTBFV6Eow9OfyXBrbu3UUiyVdFgLnVmARm6SV5YnnY3l-q_195HFtJEbzm4CtC_xk8LbNGHe1-Uh7kGjL9tGvaD_4MM0gVzTnvnJKk0vh2zJEVSoF0zcDDeQGDcFttIXEKANgHIkODs2ewMQvpuzs0AI7-Mf0d5705dBylDiTCqoVlcxaO8rJfqh9dryOj_z9bARM7fvbfPu7_AvBFGfMeBIxJICYufzFxwR5ZO946tLM7iGNNc25NjOJMJwKNYFJHor0Dwow1qKmYHGz8spm6XphZYvLZvpdDo17GRi0icao-JC8pKRHxnyzRnY7I0c2aA"  # Replace with the actual JWT passed to the backend
# result = verify_token(token)
# print(result)


# # def verify_token(token):
# #     try:
# #         # Decode the token
# #         decoded_token = jwt.decode(
# #             token,
# #             key=os.getenv("AUTH0_CLIENT_SECRET"),  # Secret from Auth0 dashboard
# #             algorithms=["HS256"],  # Algorithm from Auth0 dashboard
# #             audience="http://happyhiker/api"  # API identifier set in Auth0
# #         )
# #         return decoded_token
# #     except jwt.ExpiredSignatureError:
# #         return {"error": "Token has expired"}
# #     except jwt.InvalidAudienceError:
# #         return {"error": "Invalid audience"}
# #     except jwt.DecodeError:
# #         return {"error": "Token decode failed"}

# # # Example usage
# # token = "<user_token_here>"  # Replace with the actual JWT passed to the backend
# # result = verify_token(token)
# # print(result)




# @api_view(['POST'])
# def auth0_register(request):
#     token = request.headers.get('Authorization', '').split('Bearer ')[-1]
#     try:
#         decoded_token = validate_auth0_token(token)
#         user_email = decoded_token.get("email")
#         user_name = decoded_token.get("name")

#         # Example: Save or update user info in the database
#         # User.objects.update_or_create(email=user_email, defaults={'name': user_name})

#         return JsonResponse({"message": "User validated", "email": user_email, "name": user_name})
#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=401)



# # from django.shortcuts import render
# # from django.http import JsonResponse
# # from django.views.decorators.csrf import csrf_exempt
# # import json
# # import os
# # import jwt
# # from jwt.exceptions import InvalidTokenError
# # from .models import User, Profile

# # def auth0_register(request):
# #     if request.method == 'POST':
# #         try:
# #             # Get token from Auth header
# #             auth_header = request.headers.get('Authorization')
# #             token = auth_header.split(' ')[1]

# #             # validate and decode token
# #             decoded_token = jwt.decode(
# #                 token,
# #                 key=os.getenv("AUTH0_CLIENT_SECRET"),
# #                 algorithms=[HS256],
# #                 audience="http://happyhiker/api",
# #                 audience=os.getenv("AUTH0_CLIENT_ID")
# #             )

# #             print(f"Decoded Token: {decoded_token}")
# #             email = decoded_token.get('email')
# #             name = decoded_token.get('name')

# #             user, created = User.objects.get_or_create(email=email, defaults={'name': name})
# #             if created:
# #                 Profile.objects.create(user=user)

# #             return JsonResponse({'message': 'User processed successfully'}, status=200)
# #         except InvalidTokenError:
# #             return JsonResponse({'error': 'Invalid token'}, status=401)
# #     return JsonResponse({'error': 'Invalid method'}, status=405)
        