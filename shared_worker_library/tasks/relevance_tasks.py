import json
from shared_worker_library.tasks.OpenAI_tasks import call_openai_chat
from shared_worker_library.worker.relevance_worker import celery_app
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import (
    TaskType,
    EmailStatus,
    RelevanceModelResult,
)
from shared_worker_library.db_queries.relevance_queries import update_staging_table
from shared_worker_library.db_queries.std_queries import get_encrypted_emails, update_staging_table_failure
from common.security import decrypt_token
from typing import List, Dict
import random
from shared_worker_library.utils.to_bytes import to_bytes

logging = get_logger()
MAX_RETRIES = 3
MODEL_CONFIDENCE_THRESHOLD = 0.8


@celery_app.task(
    queue=TaskType.RELEVANCE_MODEL.queue_name, name=TaskType.RELEVANCE_MODEL.task_name
)
def relevance_task(trace_id: str, row_ids: list, attempt: int = 1):
    logging.info(f"[{trace_id}] Starting relevance task. Attempt {attempt}")

    if attempt > MAX_RETRIES:
        logging.error(f"[{trace_id}] Exceeded maximum retries for relevance task.")
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
        model_results = run_relevance_model(trace_id, normalized_emails)
    except Exception as e:
        logging.error(f"[{trace_id}] Error running relevance model: {e}")
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

    logging.info(f"[{trace_id}] Relevance task completed successfully")
    return {"status": "success", "results": results}

def decrypt_email_content(trace_id: str, encrypted_emails: List[Dict]) -> List[Dict]:
    logging.info(f"[{trace_id}] Decrypting email content")
    # This will need to be optimized to only create the necessary decrypted fields for the relevance model.
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
    logging.warning(
        f"Normalizing emails for trace_id {trace_id}. Functionality not yet implemented."
    )
    # All content for the row is pulled into the emails list. This will later be optimized to only pull necessary fields for the relevance model.
    # {
    #     "id",                     -> Generated for the staging table
    #     "subject",                -> email subject
    #     "sender",                 -> email sender
    #     "body",                   -> email body content
    # }
    # For now, we just return the emails as-is.
    return emails


def run_relevance_model(trace_id: str, emails: list[dict]) -> RelevanceModelResult:
    logging.info(f"[{trace_id}] Running relevance model via OpenAI relevance classifier.")

    relevant, retry, purge = [], [], []

    for email in emails:
        try:
            subject = email.get("subject", "")
            body = email.get("body", "")

            messages = [
                {
                    "role": "system",
                    "content": "You are a classifier that inspects an email and decides whether it is job-related."
                },
                {
                    "role": "user",
                    "content": f"Here is the email:\nSubject: {subject}\nBody: {body}\n\n"
                               "Output exactly one JSON object with keys:\n"
                               "  - job_related (boolean)\n"
                               "  - reason (short string)\n"
                               "  - confidence (0-1 float)\n\n"
                               "Example:\n"
                               '{"job_related": true, "reason": "mentions \'resume\' and \'interview\'", "confidence": 0.95}'
                }
            ]

            result = call_openai_chat(
                model="gpt-4o-mini",  # or whichever model you’re using
                messages=messages,
                max_tokens=128,
                temperature=0.0
            )

            text = result["raw"].strip()
            parsed = json.loads(text)

            if parsed.get("job_related") and parsed.get("confidence", 0) >= 0.7:
                relevant.append({"email_id": email["id"]})
            elif parsed.get("confidence", 0) < 0.4:
                purge.append({"email_id": email["id"]})
            else:
                retry.append({"email_id": email["id"]})

        except json.JSONDecodeError:
            logging.error(f"[{trace_id}] JSON parse error for email ID {email.get('id')}")
            retry.append({"email_id": email["id"]})
        except Exception as e:
            logging.error(f"[{trace_id}] OpenAI relevance model error: {e}")
            retry.append({"email_id": email["id"]})

    return RelevanceModelResult(relevant=relevant, retry=retry, purge=purge)

# def run_relevance_model(trace_id: str, emails: list[dict]) -> RelevanceModelResult:
#     logging.warning(f"[{trace_id}] Running relevance model. Functionality not yet implemented.")
#     # This is where the relevance model logic will sit. It will always receive normalized emails that have been decrypted.
#     # It should return a RelevanceModelResult object with relevant, retry, and purge lists.
#     #
#     # ITS IMPORTANT THAT WE ONLY RETURN THE ROW IDS IN THE RESULT OBJECT TO MINIMIZE DATA TRANSFER.
#     #
#     # TODO: Implement the relevance model logic here
#     #
#     # The return value should sort the email id's emails["id"] into relevant, retry, and purge lists.
#     # relevant (high confidence scores this marks the email as relevant to our applicaitons needs and sends it to the next model layer)
#     # retry (we want this email to be re-processed -> new db pull, normalization, decryption, model, db update)
#     # purge (low confidence scores -> this marks the email as not relevant in the db and prevents it from hitting our next layers)

#     relevant = []
#     retry = []
#     purge = []

#     for index, email in enumerate(emails): #CHANGE TO for email in emails: WITH PROD LOGIC unless index is needed
#         try:
#             # This is where the model should ingest the email data and produce a result (binary, confidence score, etc.)
#             # This may be adjusted to account for the specific model architecture we choose. Binary, Confidence, Multi-class, etc.
#             # But it should as it's final step produce three lists that sort the email ids into relevant, retry, and purge.
#             # For now, we simulate model behavior with a placeholder confidence score.
            
#             # ----- Random sequencing for stress testing
#             if index == 0: # force first email to always fail (testing retry logic)
#                 raise RuntimeError("Simulated model processing error for stress testing.")
            
#             if random.random() < 0.02: # random chance of failure for stress testing
#                 raise RuntimeError("Simulated model processing error for stress testing.")
            
#             model_score = random.uniform(0.7, 0.9) # random confidence score for stress testing
#             # ----- Stress test logic ends here
            
#             if model_score >= MODEL_CONFIDENCE_THRESHOLD:
#                 relevant.append({"email_id": email["id"]})
#             else:
#                 purge.append({"email_id": email["id"]})
#         except Exception as e:
#             logging.error(f"[{trace_id}] Error processing email: {e}")
#             retry.append({"email_id": email["id"]})

#     return RelevanceModelResult(relevant=relevant, retry=retry, purge=purge)

def enqueue(trace_id: str, model_results: RelevanceModelResult, attempt: int):
    logging.info(f"[{trace_id}] Splitting and enqueueing results.")
    # This function sends tasks to the proper queues based on model results.
    relevant_ids = [item["email_id"] for item in model_results.relevant]
    retry_ids = [item["email_id"] for item in model_results.retry]
    purge_ids = [item["email_id"] for item in model_results.purge]

    # Enqueue relevant emails for classification model
    if relevant_ids:
        celery_app.send_task(
            TaskType.NER_MODEL.task_name,
            args=[trace_id, relevant_ids],
            queue=TaskType.NER_MODEL.queue_name,
        )

    # Enqueue retry emails back to relevance model with incremented attempt
    if retry_ids:
        countdown = (2 ** (attempt - 1)) * 60
        relevance_task.apply_async(
            args=[trace_id, retry_ids, attempt + 1], countdown=countdown
        )
        return

    # Log relevance task enqueueing summary
    logging.info(
        f"[{trace_id}] Enqueueing summary: Enqueued {len(relevant_ids)} relevant, {len(retry_ids)} retry, and {len(purge_ids)} purge emails"
    )

    return {
        "relevant": relevant_ids,
        "retry": retry_ids,
        "purge": purge_ids,
        "attempt_next": attempt + 1 if retry_ids else attempt,
    }