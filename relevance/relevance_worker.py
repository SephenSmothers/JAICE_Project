from shared_worker_library.celery_app import celery_app
from relevance.relevance_tasks import * 
from relevance.relevance_model import init_model
from common.logger import get_logger
logging = get_logger()

MODEL_LOADED = False

@celery_app.on_after_configure.connect
def load_model_on_worker_start(**_):
    logging.info("Loading relevance model on worker start")
    global MODEL_LOADED
    if not MODEL_LOADED:
        init_model("relevance/model/relevance_v2")
        MODEL_LOADED = True
        logging.info("Relevance model loaded successfully")