from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from .model_config import CLASSIFICATION_LABELS, CONFIDENCE_THRESHOLD

model_name = "MoritzLaurer/deberta-v3-large-zeroshot-v2.0"

_model = None
_tokenizer = None
_classifier = None

# prepare candidate labels and reverse lookup
CANDIDATE_LABELS = list(CLASSIFICATION_LABELS.values())
VALUE_TO_KEY = {v: k for k, v in CLASSIFICATION_LABELS.items()}

# run the model when it is being used
def get_classifier():
    """Lazy load the classifier to avoid loading at import time."""
    global _model, _tokenizer, _classifier
    
    if _classifier is None:
        print(f"Loading classification model: {model_name}")
        
        _model = AutoModelForSequenceClassification.from_pretrained(model_name)
        _tokenizer = AutoTokenizer.from_pretrained(model_name)
        _classifier = pipeline("zero-shot-classification", model=_model, tokenizer=_tokenizer)

        print("Classification model loaded successfully")
    
    return _classifier

def classify_email_stage(email_text: str, threshold: float = CONFIDENCE_THRESHOLD):
    """ classify an email into a job application stage.
    
    Returns:
        - stage: one of the keys from CLASSIFICATION_LABELS (eg "applied", "interview", etc.)
        - second_stage: the second highest scoring stage
        
        - score: confidence score for the classification
        - second_score: confidence score for the second stage
        
        - stage_scores: mapping of all stages to their scores
        
        - raw: raw output from the model
    """

    classifier = get_classifier()

    result = classifier(
        email_text,
        candidate_labels=CANDIDATE_LABELS,
        hypothesis_template="This email is a {}.",
        multi_label=False,
    )

    # build label to score mapping
    label_scores = {lab: score for lab, score in zip(result["labels"], result["scores"])}

    # map back to internal keys
    stage_scores = {}
    for desc, score in label_scores.items():
        internal = VALUE_TO_KEY.get(desc, desc)
        stage_scores[internal] = float(score)

    # sort to get the top two stages
    sorted_stages = sorted(
        stage_scores.items(),
        key=lambda kv: kv[1],
        reverse=True,
    )
    top_label, top_score = (sorted_stages[0][0], sorted_stages[0][1]) if sorted_stages else (None, 0)

    if len(sorted_stages) > 1:
        second_label, second_score = (sorted_stages[1][0], sorted_stages[1][1])
    else:
        second_label, second_score = (None, 0)

    return {
        "stage": top_label,
        "score": float(top_score),
        "second_stage": second_label,
        "second_score": float(second_score),
        "raw": result,
        "stage_scores": stage_scores,
    }
