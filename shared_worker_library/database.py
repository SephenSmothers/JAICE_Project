import os, threading
from common.logger import get_logger
from psycopg_pool import ConnectionPool

logging = get_logger()
_pool_lock = threading.Lock()

DATABASE_URL = os.getenv("DATABASE_URL")

pool: ConnectionPool | None = None


def get_pool() -> ConnectionPool:
    """
    Initializes and returns a process-specific connection pool.
    """
    global pool
    with _pool_lock:
        if pool is None:
            logging.info("Initializing new connection pool for this process...")
            pool = ConnectionPool(
                conninfo=DATABASE_URL,
                min_size=1,
                max_size=10,
                max_lifetime=300,
                max_idle=60,
            )
    
    return pool


def get_connection():
    """
    Gets a connection from the process-specific pool.
    """
    process_pool = get_pool()
    return process_pool.connection()
