from src.packages.shared_worker_library.celery_worker import celery_app
from src.core_api.utils.logger import get_logger
logging = get_logger()

@celery_app.task(queue='relevant_mail_queue')
def finish_processing(email_data):
    """Worker at Station 2: Does the final processing."""
    logging.info(f"MODEL 2: Performing final processing on {email_data['id']}...")
    logging.info(f"MODEL 2: Finished processing {email_data['id']}.")
    return "Processing finished."