from shared_worker_library.worker.classification_model_worker import celery_app
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import TaskType, EmailStatus


logging = get_logger()


@celery_app.task(
    queue=TaskType.CLASSIFICATION_MODEL.queue_name, name=TaskType.CLASSIFICATION_MODEL.task_name
)
def classification_task(trace_id: str, row_ids: list, attempt: int = 1):
    for row_id in row_ids:
        logging.info(f"Processing classification for Trace ID: {trace_id}, Row ID: {row_id}")
        # Placeholder for classification model processing logic
        
    return {"status": "success"}