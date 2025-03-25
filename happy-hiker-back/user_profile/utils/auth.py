import jwt
from jwt import exceptions
import requests
from django.conf import settings  # Ensure you import settings

def validate_auth0_token(token):
    try:
        # Fetch JSON Web Key Set (JWKS) from Auth0
        jwks_url = f"https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json"
        jwks = requests.get(jwks_url).json()

        # Get the header from the token
        unverified_header = jwt.get_unverified_header(token)

        # Find the appropriate RSA key
        rsa_key = next(
            (
                {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
                for key in jwks["keys"]
                if "kid" in unverified_header and key["kid"] == unverified_header["kid"]
            ),
            None,
        )

        if not rsa_key:
            raise exceptions.InvalidTokenError("Unable to find appropriate key.")

        # Decode and validate the token
        decoded_token = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=settings.AUTH0_AUDIENCE,
            issuer=f"https://{settings.AUTH0_DOMAIN}/",
        )

        return decoded_token
    except exceptions.PyJWTError as e:
        raise exceptions.InvalidTokenError(f"Token validation error: {str(e)}")
