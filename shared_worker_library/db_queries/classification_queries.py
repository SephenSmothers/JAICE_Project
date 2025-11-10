from shared_worker_library.database import get_connection
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import (EmailStatus, RelevanceModelResult, EmailStage, ClassificationModelResult)

logging = get_logger()

def to_percent(value):
    """ convert a float value (0.0 to 1.0) to an integer percent (0 to 100) """
    try:
        if value is None:
            return None
        
        v = float(value)

        if 0.0 <= v <= 1.0:
            return int(v * 100)
        return int(v)
    
    except Exception:
        return None

    
def update_staging_table(trace_id: str, model_results: ClassificationModelResult):
    logging.info(f"[{trace_id}] Updating staging table with Classification Model Results.")
    with get_connection() as conn:
        with conn.cursor() as cur:
            # iterate buckets to reduce duplication
            buckets = [
                (model_results.applied, EmailStage.APPLIED.value),
                (model_results.interview, EmailStage.INTERVIEW.value),
                (model_results.offer, EmailStage.OFFER.value),
                (model_results.accepted, EmailStage.ACCEPTED.value),
                (model_results.rejected, EmailStage.REJECTED.value),
            ]

            for items, stage_val in buckets:
                for item in items:
                    top_confidence_score = to_percent(item.get("confidence") or item.get("top_score"))
                    secondary_confidence_score = to_percent(item.get("second_score"))

                    secondary_label = item.get("second_label")
                    
                    needs_review = item.get("needs_review")

                    cur.execute(
                        "UPDATE internal_staging.email_staging SET " \
                        "app_stage = %s, status = %s, confidence_score = %s, " \
                        "app_stage_secondary = %s, confidence_score_secondary = %s, " \
                        "needs_review = %s WHERE id = %s",
                        (stage_val, EmailStatus.AWAIT_TRANSFER.value, top_confidence_score, 
                         secondary_label, secondary_confidence_score, 
                         needs_review, item["email_id"]),
                        prepare=False
                    )
        conn.commit()
    logging.info(f"[{trace_id}] Staging table updated. Job Stages set and AWAIT_TRANSFER status assigned.")
    return {"status": "updated"}