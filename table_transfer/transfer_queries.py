from shared_worker_library.database import get_connection
from common.logger import get_logger
from shared_worker_library.utils.task_definitions import EmailStatus
import uuid
from common.security import decrypt_token
from shared_worker_library.utils.to_bytes import to_bytes

logging = get_logger()


def transfer_from_staging_table(trace_id: str, row_ids: list):
    logging.info(f"[{trace_id}] Transferring from staging table")
    
    try:
        data = get_data_from_staging(trace_id, row_ids)
    except Exception as e:
        logging.error(f"[{trace_id}] Error fetching data from staging: {e}")
        return {"status": "failure", "error": str(e)}

    try:
        encrypted_user_id = data[0][0]  # user_id_enc
        user_uid = decrypt_token(to_bytes(encrypted_user_id))
        logging.info(f"[{trace_id}] Decrypted user_uid = {user_uid}")
    except Exception as e:
        logging.error(f"[{trace_id}] Error decrypting user UID: {e}")
        return {"status": "failure", "error": str(e)}
    
    try:
        results = insert_into_job_apps_table(trace_id, data, user_uid)
    except Exception as e:
        logging.error(f"[{trace_id}] Error inserting data into job apps table: {e}")
        return {"status": "failure", "error": str(e)}
    
    try:
        update_results = update_staging_table(trace_id, row_ids)
    except Exception as e:
        logging.error(f"[{trace_id}] Error updating staging table: {e}")
        return {"status": "failure", "error": str(e)}
    
    return results

def get_data_from_staging(trace_id: str, row_ids: list) -> list:
    logging.info(f"[{trace_id}] Fetching data from staging table")
    
    if not row_ids:
        logging.warning(f"[{trace_id}] No row IDs provided for fetching data from staging.")
        return {'status': "row_ids list is empty"}
    
    query = """
    SELECT user_id_enc, trace_id, provider, provider_message_id, subject_enc, sender_enc, received_at_enc, body_enc, app_stage, confidence_score
    FROM internal_staging.email_staging
    WHERE id = ANY(%s)
    """
    
    data = []
    
    
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, (row_ids,), prepare=False)
                data = cur.fetchall()
    except Exception as e:
        logging.error(f"[{trace_id}] Error fetching data from staging: {e}")
        return []
    return data

def update_staging_table(trace_id: str, row_ids: list) -> dict:
    logging.info(f"[{trace_id}] Updating staging table status to PURGE")
    
    if not row_ids:
        logging.warning(f"[{trace_id}] No row IDs provided for updating staging table.")
        return {"status": "no_data"}
    
    update_query = """
    UPDATE internal_staging.email_staging
    SET status = %s
    WHERE id = ANY(%s)
    """
    
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(update_query, (EmailStatus.PURGE.value, row_ids), prepare=False)
            conn.commit()
        logging.info(f"[{trace_id}] Successfully updated staging table for {len(row_ids)} rows.")
        return {"status": "success", "rows_updated": len(row_ids)}
    except Exception as e:
        logging.error(f"[{trace_id}] Error updating staging table: {e}")
        return {"status": "failure", "error": str(e)}
    
    
def insert_into_job_apps_table(trace_id: str, rows: list, user_uid: str) -> dict:
    logging.info(f"[{trace_id}] Inserting data into job_applications table")

    if not rows:
        logging.warning(f"[{trace_id}] No rows provided for insertion.")
        return {"status": "no_data"}

    insert_query = """
    INSERT INTO public.job_applications (
        user_uid, title, company_name, description,
        app_stage, provider_source, recruiter_name, recruiter_email,
        is_archived, is_deleted, stage_confidence,
        provider_message_id, received_at
    )
    VALUES (
        %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s,
        %s, NOW()
    )
    ON CONFLICT (provider_message_id) DO NOTHING;
    """

    try:
        inserted_count = 0
        with get_connection() as conn:
            with conn.cursor() as cur:
                for row in rows:
                    (
                        _user_id_enc,
                        _trace_id,
                        provider,
                        provider_msg_id,
                        _subject_enc,
                        _sender_enc,
                        _received_at_enc,
                        _body_enc,
                        app_stage,
                        confidence_score,
                    ) = row

                    cur.execute(
                        insert_query,
                        (
                            user_uid,
                            None,  # title
                            None,  # company_name
                            None,  # description
                            app_stage,
                            provider,
                            None,  # recruiter_name
                            None,  # recruiter_email
                            False, # is_archived
                            False, # is_deleted
                            confidence_score,
                            provider_msg_id,
                        ),
                        prepare=False,
                    )
                    inserted_count += cur.rowcount

                conn.commit()

        logging.info(f"[{trace_id}] Inserted {inserted_count} rows (duplicates skipped).")
        return {"status": "success", "inserted": inserted_count}

    except Exception as e:
        logging.error(f"[{trace_id}] Error inserting data: {e}")
        return {"status": "failure", "error": str(e)}
