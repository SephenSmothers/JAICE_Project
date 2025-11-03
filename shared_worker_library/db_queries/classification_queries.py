from shared_worker_library.database import get_connection
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import (EmailStatus, RelevanceModelResult, EmailStage, ClassificationModelResult)

logging = get_logger()

def update_staging_table(trace_id: str, model_results: ClassificationModelResult):
    logging.info(f"[{trace_id}] Updating staging table with Classification Model Results.")
    with get_connection() as conn:
        with conn.cursor() as cur:
            for item in model_results.applied:
                confidence_score = int(item.get("confidence") * 100)  # Convert to percentage
                cur.execute(
                    "UPDATE internal_staging.email_staging SET app_stage = %s, status = %s, confidence_score = %s WHERE id = %s",
                    (EmailStage.APPLIED.value, EmailStatus.AWAIT_TRANSFER.value, confidence_score, item["email_id"]),
                    prepare=False
                )
            for item in model_results.interview:
                confidence_score = int(item.get("confidence") * 100)  # Convert to percentage
                cur.execute(
                    "UPDATE internal_staging.email_staging SET app_stage = %s, status = %s, confidence_score = %s WHERE id = %s",
                    (EmailStage.INTERVIEW.value, EmailStatus.AWAIT_TRANSFER.value, confidence_score, item["email_id"]),
                    prepare=False
                )
            for item in model_results.offer:
                confidence_score = int(item.get("confidence") * 100)  # Convert to percentage
                cur.execute(
                    "UPDATE internal_staging.email_staging SET app_stage = %s, status = %s, confidence_score = %s WHERE id = %s",
                    (EmailStage.OFFER.value, EmailStatus.AWAIT_TRANSFER.value, confidence_score, item["email_id"]),
                    prepare=False
                )
            for item in model_results.accepted:
                confidence_score = int(item.get("confidence") * 100)  # Convert to percentage
                cur.execute(
                    "UPDATE internal_staging.email_staging SET app_stage = %s, status = %s, confidence_score = %s WHERE id = %s",
                    (EmailStage.ACCEPTED.value, EmailStatus.AWAIT_TRANSFER.value, confidence_score, item["email_id"]),
                    prepare=False
                )
            for item in model_results.rejected:
                confidence_score = int(item.get("confidence") * 100)  # Convert to percentage
                cur.execute(
                    "UPDATE internal_staging.email_staging SET app_stage = %s, status = %s, confidence_score = %s WHERE id = %s",
                    (EmailStage.REJECTED.value, EmailStatus.AWAIT_TRANSFER.value, confidence_score, item["email_id"]),
                    prepare=False
                )
        conn.commit()
    logging.info(f"[{trace_id}] Staging table updated. Job Stages set and AWAIT_TRANSFER status assigned.")
    return {"status": "updated"}