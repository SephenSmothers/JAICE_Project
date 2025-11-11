from fastapi import APIRouter, Depends, HTTPException, Body
from starlette import status

from common.logger import get_logger
from client_api.services.supabase_client import get_connection
from client_api.deps.auth import get_current_user

logging = get_logger()
router = APIRouter()

@router.get("/latest-jobs", summary="Get all the users latest job applications from supabase.")
async def get_latest_jobs(user: dict = Depends(get_current_user)):
    logging.info(f"Fetching latest jobs for user from Supabase.")
    uid = user.get("uid")
    
    query = """
    SELECT *
    FROM public.job_applications
    WHERE user_uid = $1
    ORDER BY received_at DESC
    """
    
    try:
        async with get_connection() as conn:
            rows = await conn.fetch(query, uid)
            logging.info(f"Fetched {len(rows)} job applications for user.")
            return {'status': 'success', 'jobs':[dict(r) for r in rows]}
    
    except Exception as e:
        logging.error(f"Error fetching latest jobs for user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching job applications."
        )
        
    

@router.post("/update-stage")
async def update_job_stage(
    payload: dict = Body(...),
    user: dict = Depends(get_current_user)
):
    import uuid
    trace_id = str(uuid.uuid4())
    uid = user.get("uid")
    provider_message_id = payload.get("provider_message_id")
    
    new_stage = payload.get("app_stage")

    if not provider_message_id or not new_stage:
        raise HTTPException(status_code=400, detail="Missing required data")

    if new_stage:
        new_stage = new_stage.capitalize()
    
    query = """
        UPDATE public.job_applications
        SET app_stage = $1
        WHERE provider_message_id = $2
        AND user_uid = $3
        RETURNING provider_message_id, app_stage, updated_at
    """

    try:
        async with get_connection() as conn:
            result = await conn.fetchrow(query, new_stage, provider_message_id, uid)

        if result:
            logging.info(f"[{trace_id}] Updated job {provider_message_id} to stage {new_stage}")
            return {
                "status": "success",
                "updated": dict(result),
            }
        else:
            raise HTTPException(status_code=404, detail="Job not found")

    except Exception as e:
        logging.error(f"[{trace_id}] Error updating job stage: {e}")
        raise HTTPException(status_code=500, detail=str(e))

