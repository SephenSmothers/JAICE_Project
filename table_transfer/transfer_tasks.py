from table_transfer.transfer_worker import celery_app
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import TaskType
from table_transfer.transfer_queries import transfer_from_staging_table


logging = get_logger()


@celery_app.task(
    queue=TaskType.TRANSFER_FROM_STAGING.queue_name,
    name=TaskType.TRANSFER_FROM_STAGING.task_name,
)
def table_transfer_task(trace_id: str, row_ids: list):
    """
    Celery task for transferring data from the staging table
    to the job_applications table.
    """
    logging.info(f"[{trace_id}] Starting table transfer task with {len(row_ids)} rows.")

    try:
        result = transfer_from_staging_table(trace_id, row_ids)
        logging.info(f"[{trace_id}] Table transfer completed successfully.")
        return {"status": "success", "result": result}
    except Exception as e:
        logging.error(f"[{trace_id}] Table transfer failed: {e}")
        return {"status": "failure", "error": str(e)}