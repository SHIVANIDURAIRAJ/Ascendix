import os
from rest_framework import authentication
from rest_framework import exceptions

class GatewayUser:
    """
    Lightweight user object populated from trusted Express Gateway headers.
    """
    def __init__(self, user_id, email, role="STUDENT"):
        self.id = user_id
        self.user_id = user_id
        self.email = email
        self.role = (role or "STUDENT").upper()
        self.is_authenticated = True
        self.is_admin = self.role in ("ADMIN", "FACULTY")

    def __str__(self):
        return f"GatewayUser({self.user_id}, {self.email}, {self.role})"


class GatewayAuthentication(authentication.BaseAuthentication):
    """
    Validates that incoming requests originated from the trusted Express Gateway.
    Checks:
    1. X-Gateway-Secret matches GATEWAY_SECRET
    2. Extracts X-User-Id, X-User-Email, and X-User-Role
    """
    def authenticate(self, request):
        expected_secret = os.getenv("GATEWAY_SECRET", "ascendix_internal_secret_gateway_token_9981")
        provided_secret = request.headers.get("X-Gateway-Secret")

        # In dev mode, check if internal secret matches
        if not provided_secret or provided_secret != expected_secret:
            raise exceptions.AuthenticationFailed(
                "Access Forbidden: Request did not originate from the authenticated Ascendix Gateway."
            )

        user_id = request.headers.get("X-User-Id")
        user_email = request.headers.get("X-User-Email", "")
        user_role = request.headers.get("X-User-Role", "STUDENT")

        if not user_id:
            raise exceptions.AuthenticationFailed(
                "Access Denied: Missing student identity (X-User-Id) in gateway dispatch."
            )

        user = GatewayUser(user_id=user_id, email=user_email, role=user_role)
        return (user, None)
