from fastapi import FastAPI, HTTPException, status
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from services.firebase_admin import initialize_firebase_sdk, check_firebase_auth_health
from api.auth import router as auth_router
from services.supabase_client import check_db_pool_status, connect_to_db, close_db_connection

from utils.logger import get_logger
logging = get_logger()

# Application instance with lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Handles application startup (before 'yield') and shutdown (after 'yield') events.
    
    # STARTUP LOGIC (Runs on application start)
    try:
        logging.info("Starting up the application...")
        
        # Initialize external SDKs (Firebase/Auth)
        initialize_firebase_sdk() 
        
        # Connect to the Database
        # This function should create the global connection pool (db_pool)
        await connect_to_db() 

        logging.info("Database connected on startup.")
        logging.info("Application startup tasks completed.")

    except Exception as e:
        # If a critical dependency fails, log the error and re-raise it to crash the application, as designed.
        logging.error(f"FATAL: Startup failed: {e}")
        raise

    # The application starts serving requests here
    yield 

    # Runs when the application stops
    # Close the database connection pool gracefully
    await close_db_connection()
    logging.info("Application shutdown complete.")

# Create the FastAPI application instance with lifespan management
app = FastAPI(lifespan=lifespan)

# Allow the frontend to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use the imported router instance
# All routes will get listed here for the backend services
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])


# Sanity Checks and Health Endpoints
# --------------------------------------------
# Simple liveness check endpoint
def check_app_liveness():
    logging.info("Liveness check requested.")
    return {"status": "ok", "detail": "Application process is running"}

# Simple health check endpoint
@app.get("/health/alive", tags=["Health Checks"], summary="Is FastAPI Alive?")
def alive_check():
    """Confirms the FastAPI process is responsive (Liveness Probe)."""
    return JSONResponse(content=check_app_liveness(), status_code=status.HTTP_200_OK) 

@app.get("/health/db_alive", tags=["Health Checks"], summary="Is Database Alive?")
async def db_alive_check():
    """Confirms the database connection pool is initialized and available."""
    try:
        result = await check_db_pool_status()
        return JSONResponse(content=result, status_code=status.HTTP_200_OK)
    except HTTPException as exc:
        # Return the 503 status if the pool is not initialized
        return JSONResponse(content=exc.detail, status_code=exc.status_code)

# --- Authentication Service Liveness Check ---
@app.get("/health/auth_alive", tags=["Health Checks"], summary="Is Firebase Auth Alive?")
async def auth_alive_check():
    """Confirms that Firebase Auth service is reachable via HTTP."""
    try:
        result = await check_firebase_auth_health()
        return JSONResponse(content=result, status_code=status.HTTP_200_OK)
    except HTTPException as exc:
        # Return the 503 status if the Auth service is unreachable/failing
        return JSONResponse(content=exc.detail, status_code=exc.status_code)