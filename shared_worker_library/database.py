import os, threading
from common.logger import get_logger
from psycopg_pool import ConnectionPool
from contextlib import contextmanager

logging = get_logger()
_pool_lock = threading.Lock()

DATABASE_URL = os.getenv("WORKER_DATABASE_URL")

pool: ConnectionPool | None = None


def get_pool() -> ConnectionPool:
    """
    Initializes and returns a process-specific connection pool.
    """
    global pool
    with _pool_lock:
        if pool is None:
            logging.info("INIT NEW DB POOL FOR PROCESS")
            pool = ConnectionPool(
                conninfo=DATABASE_URL,
                min_size=1,
                max_size=15,
                max_lifetime=300,
                max_idle=60,
            )
    
    return pool

@contextmanager
def get_connection():
    """
    Gets a connection from the process-specific pool.
    """
    process_pool = get_pool()
    conn = process_pool.getconn()
    try:
        conn.prepare_threshold = 0
        logging.info("Acquired DB connection from pool")
        yield conn
    finally:
        logging.info("Releasing DB connection back to pool")
        process_pool.putconn(conn)
