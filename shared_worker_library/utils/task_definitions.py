from enum import Enum
from dataclasses import dataclass


class TaskType(Enum):
    INITIAL_SYNC = ("gmail.initial_sync", "gmail_initial_sync_queue")
    FETCH_CONTENT = ("gmail.fetch_content", "gmail_fetch_content_queue")
    RELEVANCE_MODEL = ("filter_model.relevance_task", "relevance_model_queue")
    CLASSIFICATION_MODEL = (
        "classification_model.classification_task",
        "classification_model_queue",
    )
    NER_MODEL = ("ner_model.ner_task", "ner_model_queue")
    TRANSFER_FROM_STAGING = (
        "staging_to_job_apps",
        "staging_to_job_apps_queue",
    )

    def __init__(self, task_name: str, queue_name: str):
        self.task_name = task_name
        self.queue_name = queue_name


class EmailStatus(Enum):
    AWAIT_RELEVANCE = "AWAIT_RELEVANCE"
    RETRY = "RETRY"
    PURGE = "PURGE"
    AWAIT_CLASSIFICATION = "AWAIT_CLASSIFICATION"
    FAILED_PERMANENTLY = "NOT_PROCESSABLE"
    AWAIT_TRANSFER = "AWAIT_TRANSFER"

class EmailStage(Enum):
    APPLIED = "Applied"
    INTERVIEW = "Interview"
    OFFER = "Offer"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"

@dataclass
class RelevanceModelResult:
    relevant: list
    retry: list
    purge: list


@dataclass
class ClassificationModelResult:
    applied: list
    interview: list
    offer: list
    accepted: list
    rejected: list
    retry: list