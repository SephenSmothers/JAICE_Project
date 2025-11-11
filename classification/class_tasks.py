from classification.class_worker import celery_app
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import TaskType, EmailStatus, ClassificationModelResult
from shared_worker_library.db_queries.std_queries import get_encrypted_emails, update_staging_table_failure
from classification.class_queries import update_job_app_table
from typing import List, Dict
from common.security import decrypt_token
from shared_worker_library.utils.to_bytes import to_bytes
import random


logging = get_logger()
MAX_RETRIES = 3

@celery_app.task(
    queue=TaskType.CLASSIFICATION_MODEL.queue_name, name=TaskType.CLASSIFICATION_MODEL.task_name
)
def classification_task(trace_id: str, row_ids: list, attempt: int = 1):
    logging.info(f"[{trace_id}] Starting classification task. Attempt {attempt}")
    
    if attempt > MAX_RETRIES:
        logging.error(f"[{trace_id}] Exceeded maximum retries for classification task.")
        result = update_staging_table_failure(trace_id, row_ids)
        return {"status": "failure", "result": result}
    
    try:
        encrypted_emails = get_encrypted_emails(trace_id, row_ids)
    except Exception as e:
        logging.error(f"[{trace_id}] Error fetching encrypted emails: {e}")
        return {"status": "failure", "error": str(e)}

    try:
        decrypted_emails = decrypt_email_content(trace_id, encrypted_emails)
    except Exception as e:
        logging.error(f"[{trace_id}] Error decrypting emails: {e}")
        return {"status": "failure", "error": str(e)}

    try:
        normalized_emails = normalized_emails_for_model(trace_id, decrypted_emails)
    except Exception as e:
        logging.error(f"[{trace_id}] Error normalizing emails: {e}")
        return {"status": "failure", "error": str(e)}

    try:
        model_results = run_classification_model(trace_id, normalized_emails)
    except Exception as e:
        logging.error(f"[{trace_id}] Error running classification model: {e}")
        return {"status": "failure", "error": str(e)}

    try:
        results = update_job_app_table(trace_id, model_results)
    except Exception as e:
        logging.error(f"[{trace_id}] Error updating job_applications table: {e}")
        return {"status": "failure", "error": str(e)}

    # There is no longer a need to enqueue further tasks from here
    # Classification and NER run concurrently on the raw staging data and update the job_applications table directly.

    logging.info(f"[{trace_id}] Classification task completed successfully")
    return {"status": "success", "results": results}

def decrypt_email_content(trace_id: str, encrypted_emails: List[Dict]) -> List[Dict]:
    logging.info(f"[{trace_id}] Decrypting email content")
    # This will need to be optimized to only create the necessary decrypted fields for the classification model.
    decrypted_emails = []
    for email in encrypted_emails:
        try:
            decrypted_emails.append(
                {
                    "id": email["id"],
                    "subject": decrypt_token(to_bytes(email["subject_enc"])),
                    "sender": decrypt_token(to_bytes(email["sender_enc"])),
                    "body": decrypt_token(to_bytes(email["body_enc"])),
                    "provider_message_id": email["provider_message_id"],
                }
            )
        except Exception as e:
            logging.error(f"[{trace_id}] Error decrypting email ID {email['id']}: {e}")
    return decrypted_emails

def normalized_emails_for_model(trace_id: str, emails: list[dict]) -> list[dict]:
    logging.warning(f"[{trace_id}] Normalizing emails for model. Functionality not yet implemented.")
    # All content for the row is pulled into the emails list. This will later be optimized to only pull necessary fields for the relevance model.
    # {
    #     "id",                     -> Generated for the staging table
    #     "subject",                -> email subject
    #     "sender",                 -> email sender
    #     "body",                   -> email body content
    #     "provider_message_id"     -> unique email identifier from provider used to map directly into the job applications table
    # }
    # For now, we just return the emails as-is.
    return emails

def run_classification_model(trace_id: str, emails: list[dict]) -> ClassificationModelResult:
    logging.warning(f"[{trace_id}] Running classification model. Functionality not yet implemented.")
    # This is where the classification model logic will sit. It will always receive normalized emails that have been decrypted.
    # It should return a ClassificationModelResult object with relevant, retry, and purge lists.
    #
    # ITS IMPORTANT THAT WE ONLY RETURN THE ROW IDS IN THE RESULT OBJECT TO MINIMIZE DATA TRANSFER.
    #
    # TODO: Implement the classification model logic here
    #
    # The return value should sort the email id's emails["id"] into applied, interview, offer, accepted, rejected, and retry lists.
    # For now, we simulate model behavior with placeholder logic.
    applied = {}
    interview = {}
    offer = {}
    accepted = {}
    rejected = {}
    retry = []
    for index, email in enumerate(emails):
        try:
            # This is where the model should ingest the email data and produce a result (binary, confidence score, etc.)
            # This may be adjusted to account for the specific model architecture we choose. Binary, Confidence, Multi-class, etc.
            # For now, we simulate model behavior with a placeholder confidence score.
            choice_list = ["applied", "interview", "offer", "accepted", "rejected"]
            model_choice = random.choice(choice_list)
            
            confidence = round(random.uniform(0.7, 0.99), 4)

            provider_id = email.get("provider_message_id") # This needs to be returned with the model results to map into job_applications table

            if not provider_id:
                logging.warning(f"[{trace_id}] Missing provider_message_id for email {email.get('id')}")
                continue
            
            if model_choice == "applied":
                applied[provider_id] = confidence
            elif model_choice == "interview":
                interview[provider_id] = confidence
            elif model_choice == "offer":
                offer[provider_id] = confidence
            elif model_choice == "accepted":
                accepted[provider_id] = confidence
            else:
                rejected[provider_id] = confidence

        except Exception as e:
            logging.error(f"[{trace_id}] Error processing email: {e}")
            retry.append({"email_id": email["id"]})

    return ClassificationModelResult(applied=applied, interview=interview, offer=offer, accepted=accepted, rejected=rejected, retry=retry)