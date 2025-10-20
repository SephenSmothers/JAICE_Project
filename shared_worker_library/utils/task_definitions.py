from enum import Enum


class TaskType(Enum):
    INITIAL_SYNC = ("gmail.initial_sync", "gmail_initial_sync_queue")
    FETCH_CONTENT = ("gmail.fetch_content", "gmail_fetch_content_queue")
    RELEVANCE_MODEL = ("filter_model.relevance_task", "relevance_model_queue")

    def __init__(self, task_name: str, queue_name: str):
        self.task_name = task_name
        self.queue_name = queue_name
