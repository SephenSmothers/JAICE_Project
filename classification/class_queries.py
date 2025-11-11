from shared_worker_library.db_queries.transfer_query import execute_transfer_query
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import EmailStage, ClassificationModelResult

logging = get_logger()

def update_job_app_table(trace_id: str, model_results: ClassificationModelResult):
    """
    Updates job_applications table with predicted classification stages.
    Each stage dict maps provider_message_id -> confidence score.
    """
    logging.info(f"[{trace_id}] Updating job_applications table with classification results.")

    # Build the list of tuples for batch update
    values = []
    for stage, stage_dict in [
        (EmailStage.APPLIED, model_results.applied),
        (EmailStage.INTERVIEW, model_results.interview),
        (EmailStage.OFFER, model_results.offer),
        (EmailStage.ACCEPTED, model_results.accepted),
        (EmailStage.REJECTED, model_results.rejected),
    ]:
        # stage_dict is now a mapping of {provider_message_id: confidence}
        for provider_id, confidence in stage_dict.items():
            values.append((
                stage.value,        # app_stage
                confidence,         # stage_confidence
                provider_id         # provider_message_id
            ))

    if not values:
        logging.info(f"[{trace_id}] No classification results to process.")
        return {"status": "no_updates"}

    query = """
    UPDATE public.job_applications
    SET app_stage = %s,
        stage_confidence = %s,
        updated_at = timezone('utc', now())
    WHERE provider_message_id = %s;
    """

    result = execute_transfer_query(
        trace_id=trace_id,
        query=query,
        values=values,
        commit=True,
    )

    if result["status"] == "failure":
        logging.error(f"[{trace_id}] Classification update failed: {result['error']}")
    else:
        logging.info(f"[{trace_id}] Updated {result['rows_affected']} job_applications rows successfully.")

    return result
