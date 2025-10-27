import json
from shared_worker_library.tasks.OpenAI_tasks import call_openai_chat
from shared_worker_library.worker.classification_worker import celery_app
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import TaskType, EmailStatus, ClassificationModelResult
from shared_worker_library.db_queries.std_queries import get_encrypted_emails, update_staging_table_failure
from shared_worker_library.db_queries.classification_queries import update_staging_table
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
    logging.info(f"[{trace_id}] Running classification model via OpenAI.")

    applied, interview, offer, accepted, rejected, retry = [], [], [], [], [], []

    def _normalize_stage(s: str) -> str:
        if not isinstance(s, str):
            return "unknown"
        s = s.strip().lower()
        mapping = {
            "applied": "applied",
            "application": "applied",
            "interview": "interview",
            "screen": "interview",
            "offer": "offer",
            "accepted": "accepted",
            "accept": "accepted",
            "rejected": "rejected",
            "reject": "rejected",
            "unknown": "unknown"
        }
        # direct match or fallback: title words like "Offer Stage" -> "offer"
        return mapping.get(s, mapping.get(s.split()[0], "unknown"))

    def _parse_json_safely(text: str) -> dict:
        # Model *should* return EXACT JSON, but be defensive.
        text = text.strip()
        # Fast path
        try:
            return json.loads(text)
        except Exception:
            pass
        # Fallback: extract first {...} block
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start:end+1])
            except Exception:
                pass
        raise json.JSONDecodeError("Could not parse classification JSON", text, 0)

    for email in emails:
        try:
            subject = email.get("subject", "")
            body = email.get("body", "")

            messages = [
                {
                    "role": "system",
                    "content": "You are a classification assistant that reads the email and assigns it to one of these stages: Applied, Interview, Offer, Accepted, Rejected."
                },
                {
                    "role": "user",
                    "content": (
                        "Email:\n"
                        f"Subject: {subject}\n"
                        f"Body: {body}\n\n"
                        "Output EXACTLY this JSON shape:\n"
                        "{\n"
                        '  "stage": "<Applied|Interview|Offer|Accepted|Rejected|Unknown>",\n'
                        '  "summary": "<one-sentence summary>",\n'
                        '  "confidence": <0-1>,\n'
                        '  "actionable_fields": {"company": "<name or null>", "role": "<role or null>"}\n'
                        "}"
                    )
                }
            ]

            result = call_openai_chat(
                model="gpt-4o-mini",   # use your preferred model
                messages=messages,
                max_tokens=160,
                temperature=0.0
            )

            parsed = _parse_json_safely(result["raw"])
            stage = _normalize_stage(parsed.get("stage", "unknown"))
            confidence = parsed.get("confidence", 0.0)
            email_id_obj = {"email_id": email["id"]}

            # Routing logic:
            # - If confidence is too low or stage is unknown -> retry
            # - Otherwise bucket by stage
            if not isinstance(confidence, (int, float)):
                confidence = 0.0

            if confidence < 0.50 or stage == "unknown":
                retry.append(email_id_obj)
            elif stage == "applied":
                applied.append(email_id_obj)
            elif stage == "interview":
                interview.append(email_id_obj)
            elif stage == "offer":
                offer.append(email_id_obj)
            elif stage == "accepted":
                accepted.append(email_id_obj)
            elif stage == "rejected":
                rejected.append(email_id_obj)
            else:
                # Any unexpected label -> retry to be safe
                retry.append(email_id_obj)

        except json.JSONDecodeError:
            logging.error(f"[{trace_id}] Classification JSON parse error for email ID {email.get('id')}")
            retry.append({"email_id": email["id"]})
        except Exception as e:
            logging.error(f"[{trace_id}] Classification model error: {e}")
            retry.append({"email_id": email["id"]})

    return ClassificationModelResult(
        applied=applied,
        interview=interview,
        offer=offer,
        accepted=accepted,
        rejected=rejected,
        retry=retry
    )



# def run_classification_model(trace_id: str, emails: list[dict]) -> ClassificationModelResult:
#     logging.warning(f"[{trace_id}] Running classification model. Functionality not yet implemented.")
#     # This is where the classification model logic will sit. It will always receive normalized emails that have been decrypted.
#     # It should return a ClassificationModelResult object with relevant, retry, and purge lists.
#     #
#     # ITS IMPORTANT THAT WE ONLY RETURN THE ROW IDS IN THE RESULT OBJECT TO MINIMIZE DATA TRANSFER.
#     #
#     # TODO: Implement the classification model logic here
#     #
#     # The return value should sort the email id's emails["id"] into applied, interview, offer, accepted, rejected, and retry lists.
#     # For now, we simulate model behavior with placeholder logic.
#     applied = []
#     interview = []
#     offer = []
#     accepted = []
#     rejected = []
#     retry = []

#     for index, email in enumerate(emails): #CHANGE TO for email in emails: WITH PROD LOGIC unless index is needed
#         try:
#             # This is where the model should ingest the email data and produce a result (binary, confidence score, etc.)
#             # This may be adjusted to account for the specific model architecture we choose. Binary, Confidence, Multi-class, etc.
#             # But it should as it's final step produce three lists that sort the email ids into relevant, retry, and purge.
#             # For now, we simulate model behavior with a placeholder confidence score.
            
#             if index == 0: # force first email to always fail (testing retry logic)
#                 raise RuntimeError("Simulated model processing error for stress testing.")
            
#             choice_list = ["applied", "interview", "offer", "accepted", "rejected"]
#             model_choice = random.choice(choice_list)
            
#             if model_choice == "applied":
#                 applied.append({"email_id": email["id"]})
#             elif model_choice == "interview":
#                 interview.append({"email_id": email["id"]})
#             elif model_choice == "offer":
#                 offer.append({"email_id": email["id"]})
#             elif model_choice == "accepted":
#                 accepted.append({"email_id": email["id"]})
#             else:
#                 rejected.append({"email_id": email["id"]})

#         except Exception as e:
#             logging.error(f"[{trace_id}] Error processing email: {e}")
#             retry.append({"email_id": email["id"]})

#     return ClassificationModelResult(applied=applied, interview=interview, offer=offer, accepted=accepted, rejected=rejected, retry=retry)

def enqueue(trace_id: str, model_results: ClassificationModelResult, attempt: int):
    logging.info(f"[{trace_id}] Splitting and enqueueing results")
    # This function sends tasks to the proper queues based on model results.
    
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
        classification_task.apply_async(
            args=[trace_id, retry, attempt + 1], countdown=countdown
        )
        return

    # Log relevance task enqueueing summary
    # logging.info(
    #     f"[{trace_id}] Enqueueing summary: Enqueued {len(relevant_ids)} relevant, {len(retry_ids)} retry, and {len(purge_ids)} purge emails"
    # )

    return {
        "status": "success",
        "trace_id": trace_id
    }