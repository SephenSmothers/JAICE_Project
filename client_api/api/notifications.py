from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from common.logger import get_logger
from client_api.services.supabase_client import get_connection
from client_api.deps.auth import get_current_user

logging = get_logger()
router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ------------------------------------------------------------
# Get Notification Settings
# ------------------------------------------------------------
@router.get(
    "/settings",
    summary="Get notification settings for the authenticated user"
)
async def get_notification_settings(user: dict = Depends(get_current_user)):
    uid = user.get("uid")
    logging.info(f"Fetching notification settings for user {uid}")

    # Ensures the row exists (first-time users)
    ensure_query = """
        INSERT INTO public.user_notification_settings (user_uid)
        VALUES ($1)
        ON CONFLICT (user_uid) DO NOTHING;
    """

    select_query = """
        SELECT
            app_updates_inapp,
            app_updates_email,
            app_updates_sms,
            email_parsing_inapp,
            email_parsing_email,
            email_parsing_sms,
            reminders_inapp,
            reminders_email,
            reminders_sms,
            system_inapp,
            system_email,
            system_sms
        FROM public.user_notification_settings
        WHERE user_uid = $1;
    """

    try:
        async with get_connection() as conn:
            async with conn.transaction():
                await conn.execute(ensure_query, uid)
                row = await conn.fetchrow(select_query, uid)

        if not row:
            logging.error(f"No notification settings returned for {uid}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No notification settings found."
            )

        return {"status": "success", "data": dict(row)}

    except Exception as e:
        logging.error(f"Error fetching notification settings for user {uid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching notification settings."
        )


# ------------------------------------------------------------
# Update Notification Settings
# ------------------------------------------------------------
@router.post(
    "/settings",
    summary="Update notification settings for the authenticated user"
)
async def update_notification_settings(
    payload: dict,
    user: dict = Depends(get_current_user)
):
    uid = user.get("uid")
    logging.info(f"Updating notification settings for user {uid}")

    upsert_query = """
        INSERT INTO public.user_notification_settings (
            user_uid,
            app_updates_inapp,
            app_updates_email,
            app_updates_sms,
            email_parsing_inapp,
            email_parsing_email,
            email_parsing_sms,
            reminders_inapp,
            reminders_email,
            reminders_sms,
            system_inapp,
            system_email,
            system_sms
        )
        VALUES (
            $1, $2, $3, $4,
            $5, $6, $7,
            $8, $9, $10,
            $11, $12, $13
        )
        ON CONFLICT (user_uid) DO UPDATE SET
            app_updates_inapp      = EXCLUDED.app_updates_inapp,
            app_updates_email      = EXCLUDED.app_updates_email,
            app_updates_sms        = EXCLUDED.app_updates_sms,
            email_parsing_inapp    = EXCLUDED.email_parsing_inapp,
            email_parsing_email    = EXCLUDED.email_parsing_email,
            email_parsing_sms      = EXCLUDED.email_parsing_sms,
            reminders_inapp        = EXCLUDED.reminders_inapp,
            reminders_email        = EXCLUDED.reminders_email,
            reminders_sms          = EXCLUDED.reminders_sms,
            system_inapp           = EXCLUDED.system_inapp,
            system_email           = EXCLUDED.system_email,
            system_sms             = EXCLUDED.system_sms;
    """

    try:
        values = [
            uid,
            payload.get("app_updates_inapp"),
            payload.get("app_updates_email"),
            payload.get("app_updates_sms"),
            payload.get("email_parsing_inapp"),
            payload.get("email_parsing_email"),
            payload.get("email_parsing_sms"),
            payload.get("reminders_inapp"),
            payload.get("reminders_email"),
            payload.get("reminders_sms"),
            payload.get("system_inapp"),
            payload.get("system_email"),
            payload.get("system_sms"),
        ]

        async with get_connection() as conn:
            async with conn.transaction():
                await conn.execute(upsert_query, *values)

                row = await conn.fetchrow(
                    """
                    SELECT
                        app_updates_inapp,
                        app_updates_email,
                        app_updates_sms,
                        email_parsing_inapp,
                        email_parsing_email,
                        email_parsing_sms,
                        reminders_inapp,
                        reminders_email,
                        reminders_sms,
                        system_inapp,
                        system_email,
                        system_sms
                    FROM public.user_notification_settings
                    WHERE user_uid = $1;
                    """,
                    uid,
                )

        return {"status": "success", "data": dict(row)}

    except Exception as e:
        logging.error(f"Error updating notification settings for user {uid}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating notification settings."
        )
