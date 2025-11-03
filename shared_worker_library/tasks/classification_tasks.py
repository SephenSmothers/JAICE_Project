from shared_worker_library.models.model_config import BATCH_SIZE, CONFIDENCE_THRESHOLD
from shared_worker_library.worker.classification_worker import celery_app
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import TaskType, EmailStatus, ClassificationModelResult
from shared_worker_library.db_queries.std_queries import get_encrypted_emails, update_staging_table_failure
from shared_worker_library.db_queries.classification_queries import update_staging_table
from typing import List, Dict
from common.security import decrypt_token
from shared_worker_library.utils.to_bytes import to_bytes
from shared_worker_library.models.classification_model import get_classifier

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
        results = update_staging_table(trace_id, model_results)
    except Exception as e:
        logging.error(f"[{trace_id}] Error updating staging table: {e}")
        return {"status": "failure", "error": str(e)}

    try:
        results = enqueue(trace_id, model_results, attempt)
    except Exception as e:
        logging.error(f"[{trace_id}] Error splitting and enqueueing results: {e}")
        return {"status": "failure", "error": str(e)}

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
    # }
    # For now, we just return the emails as-is.
    return emails

def run_classification_model(trace_id: str, emails: list[dict]) -> ClassificationModelResult:
    logging.warning(f"[{trace_id}] Running classification model on {len(emails)} emails")
    # This is where the classification model logic will sit. It will always receive normalized emails that have been decrypted.
    # It should return a ClassificationModelResult object with relevant, retry, and purge lists.
    #
    # ITS IMPORTANT THAT WE ONLY RETURN THE ROW IDS IN THE RESULT OBJECT TO MINIMIZE DATA TRANSFER.
    #
    # TODO: Implement the classification model logic here
    #
    # The return value should sort the email id's emails["id"] into applied, interview, offer, accepted, rejected, and retry lists.
    # For now, we simulate model behavior with placeholder logic.
    applied = []
    interview = []
    offer = []
    accepted = []
    rejected = []
    retry = []

    try:
        # Get the classifier (lazy loaded)
        classifier = get_classifier()
        logging.info(f"[{trace_id}] Classification model loaded successfully")

    except Exception as e:
        logging.error(f"[{trace_id}] Failed to load classification model: {e}")
        # If model loading fails, put all emails in retry
        retry = [{"email_id": email["id"]} for email in emails]

        return ClassificationModelResult(applied=applied, interview=interview, offer=offer, accepted=accepted, rejected=rejected, retry=retry)
    
    for i in range(0, len(emails), BATCH_SIZE):
        batch = emails[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (len(emails) + BATCH_SIZE - 1) // BATCH_SIZE
        logging.info(f"[{trace_id}] Processing batch {batch_num}/{total_batches}: {len(batch)} emails")

        try:
            # prepare batch texts
            batch_texts = []
            for email in batch:
                # This is where the model should ingest the email data and produce a result (binary, confidence score, etc.)
                # This may be adjusted to account for the specific model architecture we choose. Binary, Confidence, Multi-class, etc.
                # But it should as it's final step produce three lists that sort the email ids into relevant, retry, and purge.
                # For now, we simulate model behavior with a placeholder confidence score.
                
                # combine email content for classification
                email_text = f"Subject: {email['subject']} \nFrom: {email['sender']} \nBody: {email['body']}"
                batch_texts.append(email_text)

            # use the classification model
            # classify entire batch at once
            batch_results = []
            for text in batch_texts:
                result = classifier(
                    text,
                    candidate_labels=["applied", "interview", "offer", "accepted", "rejected"]
                )
                batch_results.append(result)
                
            #process batch results
            for email, result in zip(batch, batch_results):

                # get the highest confidence prediction
                predicted_label = result['labels'][0]
                confidence = result['scores'][0]

                # store confidence score in db
                confidence_score = confidence

                # sort into list based on predicted label
                if predicted_label == "applied":
                    applied.append({"email_id": email["id"], "confidence": confidence_score})
                elif predicted_label == "interview":
                    interview.append({"email_id": email["id"], "confidence": confidence_score})
                elif predicted_label == "offer":
                    offer.append({"email_id": email["id"], "confidence": confidence_score})
                elif predicted_label == "accepted":
                    accepted.append({"email_id": email["id"], "confidence": confidence_score})
                else:
                    rejected.append({"email_id": email["id"], "confidence": confidence_score})

        except Exception as e:
            logging.error(f"[{trace_id}] Error processing email: {email['id']}, {e}")
            retry.append({"email_id": email["id"]})

    # Log classification results summary
    logging.info(f"[{trace_id}] Classification results: applied={len(applied)}, interview={len(interview)}, offer={len(offer)}, accepted={len(accepted)}, rejected={len(rejected)}, retry={len(retry)}")

    return ClassificationModelResult(applied=applied, interview=interview, offer=offer, accepted=accepted, rejected=rejected, retry=retry)

def enqueue(trace_id: str, model_results: ClassificationModelResult, attempt: int):
    logging.info(f"[{trace_id}] Splitting and enqueueing results")
    # This function sends tasks to the proper queues based on model results.P
    
    applied = [item["email_id"] for item in model_results.applied]
    interview = [item["email_id"] for item in model_results.interview]
    offer = [item["email_id"] for item in model_results.offer]
    accepted = [item["email_id"] for item in model_results.accepted]
    rejected = [item["email_id"] for item in model_results.rejected]
    retry = [item["email_id"] for item in model_results.retry]

    # Enqueue relevant emails for classification model
    email_ids = applied + interview + offer + accepted + rejected
    if email_ids:
        celery_app.send_task(
            TaskType.TRANSFER_FROM_STAGING.task_name,
            args=[trace_id, email_ids],
            queue=TaskType.TRANSFER_FROM_STAGING.queue_name,
        )

    # Enqueue retry emails back to classification model with incremented attempt
    if retry:
        countdown = (2 ** (attempt - 1)) * 60
        logging.info(f"[{trace_id}] Enqueueing {len(retry)} emails for retry with countdown {countdown}s")
        classification_task.apply_async(
            args=[trace_id, retry, attempt + 1], countdown=countdown
        )


    # Log relevance task enqueueing summary
    logging.info(f"[{trace_id}] Enqueueing summary: Enqueued {len(email_ids)} relevant, {len(retry)} retry emails")

    return {
        "status": "success",
        "trace_id": trace_id,
        "classified_count": len(email_ids),
        "retry_count": len(retry),
    }