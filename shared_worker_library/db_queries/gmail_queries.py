from shared_worker_library.database import get_connection
from common.logger import get_logger

logging = get_logger()


def get_refresh_token(uid: str) -> str | None:
    """Fetches the refresh token for a given user ID."""
    logging.info("Fetching refresh token")
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT google_refresh_token FROM user_account WHERE user_id = %s",
                (uid,),
            )
            row = cur.fetchone()
            logging.info(f"Retrieved refresh token. Found: {row is not None}")
            return row[0] if row else None
