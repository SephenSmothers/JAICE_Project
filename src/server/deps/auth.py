from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from services.firebase_admin import verify_id_token

# Security scheme for HTTP Bearer authentication
bearer = HTTPBearer(auto_error=False)

# Dependency that verifies Firebase ID tokens on protected routes
async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    # If no credentials are provided, raise a 401 Unauthorized error
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    try:
        # Verify the ID token using Firebase Admin SDK
        decoded = verify_id_token(creds.credentials)
        # Return decoded user information if verification is successful
        return decoded
    except Exception:
        # If verification fails, raise a 401 Unauthorized error
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid/expired token")
    