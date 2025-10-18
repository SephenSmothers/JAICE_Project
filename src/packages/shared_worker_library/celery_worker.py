from celery import Celery
from kombu import Queue

redis_url = "redis://redis:6379/0"

task_queues = (
  Queue("new_mail_queue"),
  Queue("relevant_mail_queue"),
)

celery_app = Celery(
  "JAICE",
  broker=redis_url,
  backend=redis_url,
  task_queues=task_queues,
  include=[
    "tasks.model_1_tasks",
    "tasks.model_2_tasks",
  ]
)