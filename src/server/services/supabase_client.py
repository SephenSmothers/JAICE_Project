# supabase_client.py (UPDATED for asyncpg)

from http.client import HTTPException
from fastapi import status
import asyncpg
from asyncpg.exceptions import InvalidPasswordError, CannotConnectNowError
import os
from dotenv import load_dotenv
from utils.logger import get_logger

logging = get_logger()
# Set up logging for granular debug information

# Load environment variables to ensure we can access DATABASE_URL immediately
load_dotenv()
global db_pool
# Connection Pool Resource
db_pool = None

ADMIN_USER=os.getenv("ADMIN_USER")
DB_PASSWORD=os.getenv("DB_PASSWORD")
DB_HOST=os.getenv("DB_HOST")
DB_NAME=os.getenv("DB_NAME")
DB_PORT=os.getenv("DB_PORT")
DATABASE_URL = f"postgresql://{ADMIN_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require"

async def connect_to_db():
    # Initializes the asyncpg connection pool
    global db_pool
    
    # Ensure DATABASE_URL is set
    if not DATABASE_URL:
        logging.error("DATABASE_URL environment variable is not set.")
        raise ValueError("DATABASE_URL environment variable is not set for asyncpg.")
    
    logging.info("Attempting to connect to the database pool")

    # Create a connection pool with a 5 second timeout
    try:
        # If we fail this connect, it will raise an exception below
        db_pool = await asyncpg.create_pool(
            DATABASE_URL,
            ssl=False,
            timeout=5,         
            command_timeout=60,
            min_size=1,
            max_size=10
        )
        logging.info("Database connection pool established successfully.")
    
    # PASSWORD Error -> It was either changed or not properly set up.
    except InvalidPasswordError:
        logging.error("FATAL: Database connection failed. REASON: Invalid Password/Credentials.")
        raise

    # Every other exception will be caught here. Check console logs for clues as to why.
    except Exception as e:
        logging.error(f"FATAL: Unhandled error connecting to pool: {e.__class__.__name__}: {e.args}")
        raise RuntimeError("Database connection failed. See logged error above.")

async def close_db_connection():
    """Closes the database connection pool on application shutdown."""
    global db_pool
    if db_pool:
        logging.info("Closing database connection pool.")
        await db_pool.close()

# Health check for the database connection pool
async def check_db_pool_status():
    logging.info("Checking database connection pool status.")
    if db_pool is None:
        logging.error("Database pool not initialized (Startup failed).")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
            detail="Database pool not initialized (Startup failed)."
        )
    logging.info("Database pool is active.")
    return {"status": "ok", "detail": "DB Pool Active"}
