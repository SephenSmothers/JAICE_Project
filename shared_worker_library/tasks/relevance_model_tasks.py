from shared_worker_library.worker.relevance_model_worker import celery_app
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import TaskType
logging = get_logger()

@celery_app.task(queue=TaskType.RELEVANCE_MODEL.queue_name, name=TaskType.RELEVANCE_MODEL.task_name)
def relevance_task(trace_id: str, row_ids: list):
    logging.info(f"[{trace_id}] model: processing {len(row_ids)} rows for relevance")
    try:
        # Stub: Implement relevance model processing here
        for row_id in row_ids:
            logging.info(f"[{trace_id}] model: processing row ID {row_id}")
        logging.info(f"[{trace_id}] model: completed processing {len(row_ids)} rows for relevance")
    except Exception as e:
        logging.error(f"[{trace_id}] model: failed to process rows - {str(e)}", exc_info=True)
        raise