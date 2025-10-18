from src.packages.shared_worker_library.celery_worker import celery_app
from src.packages.shared_worker_library.tasks.model_2_tasks import finish_processing # Import the next task in the chain
from src.core_api.utils.logger import get_logger
logging = get_logger()

@celery_app.task(queue='new_mail_queue')
def inspect_email(email_data):
    """Worker at Station 1: Inspects the email."""
    logging.info(f"MODEL 1: Inspecting email {email_data['id']}...")
    is_relevant = True
    if is_relevant:
        logging.info(f"MODEL 1: Email {email_data['id']} is relevant. Sending to Station 2.")
        finish_processing.delay(email_data)
    else:
        logging.info(f"MODEL 1: Email {email_data['id']} is not relevant. Discarding.")
    return "Inspection complete."