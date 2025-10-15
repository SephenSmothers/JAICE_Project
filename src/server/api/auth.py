import os, jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from google_auth_oauthlib.flow import Flow
from pathlib import Path
from deps.auth import get_current_user, get_user_from_token_query
from utils.security import encrypt_token

from utils.logger import get_logger
logging = get_logger()

# Create a new router object
router = APIRouter()

FRONTEND_DASHBOARD_URL = os.getenv("FRONTEND_DASHBOARD_URL")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
BACKGROUND_DURATION_DAYS=int(os.getenv("BACKGROUND_DURATION_DAYS"))
SCOPES = os.getenv("PERMISSIONS_SCOPES").strip("[]").replace('"', '').split(",")
REDIRECT_URI = os.getenv("REDIRECT_URI")
CLIENT_SECRETS_FILE = Path(__file__).resolve().parent.parent / os.getenv("CLIENT_FILE_NAME")

@router.get(
  "/consent",
  summary="Generates the Google OAuth2 consent screen URL."
)
def get_oauth_consent_url(
  user: dict = Depends(get_user_from_token_query)
):
  uid = user.get("uid")
  logging.info(f"Generating OAuth2 consent URL for user: {uid}")
  
  flow = Flow.from_client_secrets_file(
      CLIENT_SECRETS_FILE,
      scopes=SCOPES,
      redirect_uri=REDIRECT_URI
  )
  
  auth_url, state = flow.authorization_url(
    access_type='offline',
    state=uid
  )
  logging.debug(f"OAuth2 consent URL generated: {auth_url}")
  return RedirectResponse(auth_url)


@router.get("/google/callback",
    summary="Handles the OAuth 2.0 callback from Google."
)
async def oauth_callback(request: Request, code: str, state: str):
    """
    Exchanges the authorization code for a refresh token and updates the user's
    record in the database.
    """
    uid = state 
    logging.info(f"Received OAuth callback for user: {uid}")
    
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    
    try:
        flow.fetch_token(code=code)
        credentials = flow.credentials
        refresh_token = credentials.refresh_token
        
        if not refresh_token:
            logging.error(f"Refresh token not received for user: {uid}. User may have denied offline access.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token was not provided by Google. Please ensure you grant offline access."
            )
            
    except Exception as e:
        logging.error(f"Error fetching token from Google for user {uid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to exchange authorization code with Google."
        )

    logging.info(f"Successfully received refresh token for user: {uid}. Updating database.")
    encrypted_refresh_token = encrypt_token(refresh_token)
    pool = request.app.state.pool
    
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                """
                UPDATE user_account 
                SET 
                    google_refresh_token = $1, 
                    gmail_connected = True,
                    gmail_connected_at = NOW()
                WHERE user_id = $2
                """,
                encrypted_refresh_token,
                uid
            )
        logging.info(f"Database successfully updated for user: {uid}")
    except Exception as e:
        logging.error(f"DB WRITE ERROR during OAuth callback for user {uid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while storing refresh token."
        )

    return RedirectResponse(FRONTEND_DASHBOARD_URL)
  
def phase_1_mint_jwt(uid: str) -> str:
  logging.info(f"Minting RLS JWT for user: {uid}")
  supabase_secret = os.getenv("SUPABASE_JWT_SECRET")
  
  if not supabase_secret:
      logging.error("SUPABASE_JWT_SECRET environment variable is not set.")
      raise ValueError("SUPABASE_JWT_SECRET environment variable is not set. Cannot sign RLS token.")
  
  expiration_time = datetime.now(timezone.utc) + timedelta(days=BACKGROUND_DURATION_DAYS)
  
  payload = {
      "sub": uid,           
      "user_id": uid,
      "role": "authenticated",
      "iat": datetime.now(timezone.utc).timestamp(),
      "exp": expiration_time.timestamp(),
  }
  logging.debug(f"RLS JWT payload: {payload}")
  return jwt.encode(
      payload,
      supabase_secret,
      algorithm=JWT_ALGORITHM
  )

async def phase_2_store_and_respond(
  request: Request,
  user_data: str, 
  refresh_token: str, 
  backend_jwt: str
) -> JSONResponse:
  logging.info(f"Storing RLS JWT and refresh token for user: {user_data.get('uid')}")
  pool = request.app.state.pool
  encrypted_refresh_token = encrypt_token(refresh_token)
  uid = user_data.get("uid")
  user_email = user_data.get("email")
  try:
    logging.debug("Acquiring a database connection from the pool...")
    async with pool.acquire() as conn:
        logging.debug("Database connection acquired.")
        await conn.execute(
            """
            INSERT INTO user_account (
                user_id, 
                user_email, 
                backend_rls_jwt
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id) DO NOTHING
            """,
            uid, 
            user_email,
            backend_jwt
        )
        logging.info(f"Successfully stored RLS JWT and refresh token for user: {uid}")
  except Exception as e:
    logging.error(f"DB WRITE ERROR during RLS setup: {e}")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Database error during RLS session setup."
    )
    
  logging.info(f"RLS session established for user: {uid}")
  return JSONResponse({
    "status": "Success",
    "message": "RLS session established.",
    "user_id":uid
  })

@router.post("/setup-rls-session", 
  status_code=status.HTTP_200_OK,
  summary="Verifies Firebase token, mints RLS JWT, and initializes user DB row."
)
async def setup_rls_session(
  request: Request,
  user_data: str = Depends(get_current_user)
):
  logging.info(f"Setting up RLS session for user: {user_data.get('uid')}")
  try:
    logging.debug("Minting backend RLS JWT...")
    backend_jwt = phase_1_mint_jwt(user_data.get('uid'))
    
  except Exception as e:
    logging.error(f"JWT MINTING ERROR: {e}")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Critical system error during JWT minting: {e}"
    )

  DUMMY_REFRESH_TOKEN = "NO_GMAIL_TOKEN_GRANTED"
  try:
    logging.debug("Storing tokens and responding to client...")
    return await phase_2_store_and_respond(
      request, 
      user_data, 
      refresh_token=DUMMY_REFRESH_TOKEN, 
      backend_jwt=backend_jwt
    )
  
  except Exception as e:
    logging.error(f"Critical system error during session setup: {e}")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Critical system error during session setup: {e}"
    )

@router.get("/gmail-consent-status",
    summary="Gets the current user's gmail consent status from the database."
)
async def is_gmail_consent_provided(
    request: Request,
    user: dict = Depends(get_current_user)
):
  uid = user.get("uid")
  pool = request.app.state.pool
  
  logging.info(f"Fetching gmail status for user: {uid}")
  
  try:
    async with pool.acquire() as conn:
      record = await conn.fetchrow(
          "SELECT gmail_connected FROM user_account WHERE user_id = $1",
          uid
      )
      
      if record is None:
          logging.error(f"CRITICAL: User row not found for UID: {uid}. The initial setup may have failed.")
          raise HTTPException(
              status_code=status.HTTP_404_NOT_FOUND,
              detail="User record not found. Please log out and log in again."
          )
      is_connected = record['gmail_connected']
      logging.info(f"Gmail connection status for user {uid}: {is_connected}")
      return {"isConnected": is_connected}

  except HTTPException as e:
    raise e
  except Exception as e:
    logging.error(f"DB READ ERROR for user {uid}: {e}")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="A database error occurred while fetching user status."
    )
    
# Protected endpoint to get current user info
# The path here is relative to the prefix in main.py
@router.get("/me")
def me(user=Depends(get_current_user)):
  # Get the current authenticated user's information
  return {"uid": user["uid"], "email": user.get("email")}

