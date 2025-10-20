"""Worker initialization for Gmail tasks."""
from shared_worker_library.celery_app import celery_app
import shared_worker_library.tasks.gmail_tasks

