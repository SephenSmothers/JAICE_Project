import os, jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse

from deps.auth import get_current_user
from utils.security import encrypt_token

from utils.logger import get_logger
logging = get_logger()

# Create a new router object
router = APIRouter()

FRONTEND_DASHBOARD_URL = "http://localhost:5173/home"
JWT_ALGORITHM = "HS256"
BACKGROUND_DURATION_DAYS=365 # 1 year validity for backend JWT

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
                google_refresh_token, 
                backend_rls_jwt, 
                email_parser_status,
                user_email
            )
            VALUES ($1, $2, $3, 'Needs Permission', $4)
            ON CONFLICT (user_id) DO UPDATE SET
                google_refresh_token = EXCLUDED.google_refresh_token,
                backend_rls_jwt = EXCLUDED.backend_rls_jwt,
                email_parser_status = 'Needs Permission',
                user_email = EXCLUDED.user_email,
                updated_at = NOW()
            """,
            uid, 
            encrypted_refresh_token, 
            backend_jwt,
            user_email
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

  DUMMY_REFRESH_TOKEN = "NO_GMAIL_TOKEN_GRANTED" # Placeholder that gets updated on email parsing consent
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

# Protected endpoint to get current user info
# The path here is relative to the prefix in main.py
@router.get("/me")
def me(user=Depends(get_current_user)):
  # Get the current authenticated user's information
  return {"uid": user["uid"], "email": user.get("email")}

