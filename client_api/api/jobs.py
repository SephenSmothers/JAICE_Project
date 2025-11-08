from fastapi import APIRouter, Depends, HTTPException, status
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