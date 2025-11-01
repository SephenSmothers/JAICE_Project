from shared_worker_library.database import get_connection
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import EmailStatus, RelevanceModelResult

logging = get_logger()


def update_staging_table(trace_id: str, model_results: RelevanceModelResult):
    logging.info(f"[{trace_id}] Updating staging table")
    with get_connection() as conn:
        with conn.cursor() as cur:
            if model_results.relevant:
                cur.execute(
                    "UPDATE internal_staging.email_staging SET status = %s WHERE id = ANY(%s)",
                    (EmailStatus.AWAIT_CLASSIFICATION.value, [str(email_id) for email_id in model_results.relevant]),
                    prepare=False
                )
            if model_results.purge:
                cur.execute(
                    "UPDATE internal_staging.email_staging SET status = %s WHERE id = ANY(%s)",
                    (EmailStatus.PURGE.value, [str(email_id) for email_id in model_results.purge]),
                    prepare=False
                )
            if model_results.retry:
                cur.execute(
                    "UPDATE internal_staging.email_staging SET status = %s WHERE id = ANY(%s)",
                    (EmailStatus.RETRY.value, [str(email_id) for email_id in model_results.retry]),
                    prepare=False
                )
                
        conn.commit()
    logging.info(f"[{trace_id}] Staging table updated")
    return {"status": "updated"}

