from shared_worker_library.database import get_connection
from common.logger import get_logger
from psycopg.rows import dict_row
from shared_worker_library.utils.task_definitions import EmailStatus

logging = get_logger()

def get_encrypted_emails(trace_id: str, row_ids: list[int]):
    logging.info(f"[{trace_id}] Getting encrypted emails for row IDs: {row_ids}")
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT id, subject_enc, sender_enc, body_enc FROM internal_staging.email_staging WHERE id = ANY(%s)",
                (row_ids,),
                prepare=False
            )
            results = cur.fetchall()
            logging.info(f"[{trace_id}] Retrieved {len(results)} encrypted emails")
            return results


def update_staging_table_failure(trace_id: str, row_ids: list[int]):
    logging.info(
        f"Updating staging table to FAILED_PERMANENTLY for trace_id {trace_id}"
    )
    with get_connection() as conn:
        with conn.cursor() as cur:
            for row_id in row_ids:
                cur.execute(
                    "UPDATE internal_staging.email_staging SET status = %s WHERE id = %s",
                    (EmailStatus.FAILED_PERMANENTLY.value, row_id),
                    prepare=False,
                )
        conn.commit()
    logging.info(f"[{trace_id}] Staging table updated to FAILED_PERMANENTLY")
    return {"status": "updated_to_failed_permanently"}