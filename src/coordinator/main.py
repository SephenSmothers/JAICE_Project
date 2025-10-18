import sys
from fastapi import FastAPI
from src.packages.shared_worker_library.tasks.model_1_tasks import inspect_email
from src.core_api.utils.logger import get_logger

logging = get_logger()

app = FastAPI()

@app.post("/tasks/initial-sync/{user_id}")
def trigger_initial_sync(user_id: str):
    """Triggers a full email sync for a new user."""
    logging.info(f"COORDINATOR: Queuing initial sync for user {user_id}")
    inspect_email.delay(user_id=user_id)
    return {"status": "ok", "message": f"Initial sync job queued for user {user_id}."}

@app.post("/webhooks/gmail")
def handle_gmail_webhook(payload: dict):
    """Receives a push notification from Google and queues a job."""
    logging.info("COORDINATOR: Received a webhook from Google.")
    user_id = "user_from_webhook_payload"
    inspect_email.delay(user_id=user_id)
    return {"status": "ok"}, 200